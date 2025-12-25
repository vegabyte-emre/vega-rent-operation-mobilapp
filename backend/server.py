from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'fleetease')]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'fleetease-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="FleetEase API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# ==================== MODELS ====================

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    full_name: str
    role: str = "staff"
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plate: str
    brand: str
    model: str
    year: int
    segment: str
    transmission: str
    fuel_type: str
    seat_count: int = 5
    door_count: int = 4
    daily_rate: float
    color: str
    mileage: int
    status: str = "available"  # available, reserved, rented, maintenance
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tc_no: str
    full_name: str
    email: str
    phone: str
    address: str
    license_no: Optional[str] = None
    license_class: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    customer_id: str
    start_date: datetime
    end_date: datetime
    pickup_location: str
    return_location: str
    status: str = "created"  # created, confirmed, delivered, returned, closed
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReservationWithDetails(BaseModel):
    id: str
    vehicle_id: str
    customer_id: str
    start_date: datetime
    end_date: datetime
    pickup_location: str
    return_location: str
    status: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime
    vehicle: Optional[Vehicle] = None
    customer: Optional[Customer] = None

class DeliveryCreate(BaseModel):
    reservation_id: str
    km_reading: int
    fuel_level: int
    photos: List[str]
    notes: Optional[str] = None
    kvkk_consent: bool

class Delivery(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reservation_id: str
    km_reading: int
    fuel_level: int
    photos: List[str]
    notes: Optional[str] = None
    kvkk_consent: bool
    delivered_by: str
    delivered_at: datetime = Field(default_factory=datetime.utcnow)

class ReturnCreate(BaseModel):
    reservation_id: str
    km_reading: int
    fuel_level: int
    photos: List[str]
    damage_photos: Optional[List[str]] = None
    damage_notes: Optional[str] = None
    extra_charges: Optional[float] = None
    notes: Optional[str] = None

class Return(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reservation_id: str
    km_reading: int
    fuel_level: int
    photos: List[str]
    damage_photos: Optional[List[str]] = None
    damage_notes: Optional[str] = None
    extra_charges: Optional[float] = None
    notes: Optional[str] = None
    returned_by: str
    returned_at: datetime = Field(default_factory=datetime.utcnow)

class GPSVehicle(BaseModel):
    vehicle_id: str
    plate: str
    latitude: float
    longitude: float
    speed: float
    last_update: datetime

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        user_data = await db.users.find_one({"id": user_id})
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user_data)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "FleetEase API v1.0", "status": "running"}

# Auth Routes
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user_data = await db.users.find_one({"email": request.email})
    
    if not user_data:
        # Create default admin user if not exists
        if request.email == "admin@fleetease.com" and request.password == "admin123":
            new_user = User(
                email="admin@fleetease.com",
                password_hash=hash_password("admin123"),
                full_name="Super Admin",
                role="superadmin",
                phone="+90 555 123 4567"
            )
            await db.users.insert_one(new_user.dict())
            user_data = new_user.dict()
        else:
            raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**user_data)
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user.id, user.email)
    
    return LoginResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            phone=user.phone
        )
    )

# Vehicle Routes
@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(current_user: User = Depends(get_current_user)):
    vehicles = await db.vehicles.find().to_list(1000)
    
    # Seed sample data if empty
    if not vehicles:
        await seed_sample_data()
        vehicles = await db.vehicles.find().to_list(1000)
    
    return [Vehicle(**v) for v in vehicles]

@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str, current_user: User = Depends(get_current_user)):
    vehicle = await db.vehicles.find_one({"id": vehicle_id})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return Vehicle(**vehicle)

# Reservation Routes
@api_router.get("/reservations", response_model=List[ReservationWithDetails])
async def get_reservations(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if status:
        query["status"] = status
    
    reservations = await db.reservations.find(query).to_list(1000)
    
    # Seed sample data if empty
    if not reservations:
        await seed_sample_data()
        reservations = await db.reservations.find(query).to_list(1000)
    
    result = []
    for r in reservations:
        res = ReservationWithDetails(**r)
        # Get vehicle and customer details
        vehicle = await db.vehicles.find_one({"id": r["vehicle_id"]})
        customer = await db.customers.find_one({"id": r["customer_id"]})
        if vehicle:
            res.vehicle = Vehicle(**vehicle)
        if customer:
            res.customer = Customer(**customer)
        result.append(res)
    
    return result

@api_router.get("/reservations/{reservation_id}", response_model=ReservationWithDetails)
async def get_reservation(reservation_id: str, current_user: User = Depends(get_current_user)):
    reservation = await db.reservations.find_one({"id": reservation_id})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    res = ReservationWithDetails(**reservation)
    vehicle = await db.vehicles.find_one({"id": reservation["vehicle_id"]})
    customer = await db.customers.find_one({"id": reservation["customer_id"]})
    if vehicle:
        res.vehicle = Vehicle(**vehicle)
    if customer:
        res.customer = Customer(**customer)
    
    return res

# Delivery Routes
@api_router.post("/deliveries", response_model=Delivery)
async def create_delivery(data: DeliveryCreate, current_user: User = Depends(get_current_user)):
    # Check reservation exists
    reservation = await db.reservations.find_one({"id": data.reservation_id})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation["status"] != "confirmed":
        raise HTTPException(status_code=400, detail="Reservation is not in confirmed status")
    
    delivery = Delivery(
        reservation_id=data.reservation_id,
        km_reading=data.km_reading,
        fuel_level=data.fuel_level,
        photos=data.photos,
        notes=data.notes,
        kvkk_consent=data.kvkk_consent,
        delivered_by=current_user.id
    )
    
    await db.deliveries.insert_one(delivery.dict())
    
    # Update reservation status
    await db.reservations.update_one(
        {"id": data.reservation_id},
        {"$set": {"status": "delivered"}}
    )
    
    # Update vehicle status
    await db.vehicles.update_one(
        {"id": reservation["vehicle_id"]},
        {"$set": {"status": "rented", "mileage": data.km_reading}}
    )
    
    return delivery

# Return Routes
@api_router.post("/returns", response_model=Return)
async def create_return(data: ReturnCreate, current_user: User = Depends(get_current_user)):
    # Check reservation exists
    reservation = await db.reservations.find_one({"id": data.reservation_id})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    if reservation["status"] != "delivered":
        raise HTTPException(status_code=400, detail="Reservation is not in delivered status")
    
    return_record = Return(
        reservation_id=data.reservation_id,
        km_reading=data.km_reading,
        fuel_level=data.fuel_level,
        photos=data.photos,
        damage_photos=data.damage_photos,
        damage_notes=data.damage_notes,
        extra_charges=data.extra_charges,
        notes=data.notes,
        returned_by=current_user.id
    )
    
    await db.returns.insert_one(return_record.dict())
    
    # Update reservation status
    await db.reservations.update_one(
        {"id": data.reservation_id},
        {"$set": {"status": "returned"}}
    )
    
    # Update vehicle status
    await db.vehicles.update_one(
        {"id": reservation["vehicle_id"]},
        {"$set": {"status": "available", "mileage": data.km_reading}}
    )
    
    return return_record

# GPS Routes
@api_router.get("/gps/vehicles", response_model=List[GPSVehicle])
async def get_gps_vehicles(current_user: User = Depends(get_current_user)):
    gps_data = await db.gps_data.find().to_list(1000)
    return [GPSVehicle(**g) for g in gps_data]

# ==================== SEED DATA ====================

async def seed_sample_data():
    """Seed sample data for demo"""
    
    # Sample Vehicles
    vehicles = [
        Vehicle(id="v1", plate="34 ABC 123", brand="Toyota", model="Corolla", year=2023, segment="Ekonomi", transmission="Otomatik", fuel_type="Benzin", daily_rate=850, color="Beyaz", mileage=15000, status="available"),
        Vehicle(id="v2", plate="34 DEF 456", brand="Volkswagen", model="Passat", year=2022, segment="Orta", transmission="Otomatik", fuel_type="Dizel", daily_rate=1200, color="Siyah", mileage=28000, status="reserved"),
        Vehicle(id="v3", plate="34 GHI 789", brand="BMW", model="320i", year=2023, segment="Lüks", transmission="Otomatik", fuel_type="Benzin", daily_rate=2500, color="Mavi", mileage=8000, status="available"),
        Vehicle(id="v4", plate="34 JKL 012", brand="Mercedes", model="C200", year=2022, segment="Lüks", transmission="Otomatik", fuel_type="Dizel", daily_rate=2800, color="Gri", mileage=22000, status="rented"),
        Vehicle(id="v5", plate="34 MNO 345", brand="Renault", model="Clio", year=2023, segment="Ekonomi", transmission="Manuel", fuel_type="Benzin", daily_rate=650, color="Kırmızı", mileage=5000, status="available"),
        Vehicle(id="v6", plate="34 PRS 678", brand="Fiat", model="Egea", year=2022, segment="Ekonomi", transmission="Manuel", fuel_type="Dizel", daily_rate=700, color="Beyaz", mileage=35000, status="available"),
        Vehicle(id="v7", plate="34 TUV 901", brand="Hyundai", model="Tucson", year=2023, segment="SUV", transmission="Otomatik", fuel_type="Hibrit", daily_rate=1800, color="Yeşil", mileage=12000, status="available"),
        Vehicle(id="v8", plate="34 WXY 234", brand="Nissan", model="Qashqai", year=2022, segment="SUV", transmission="Otomatik", fuel_type="Benzin", daily_rate=1500, color="Gri", mileage=18000, status="maintenance"),
        Vehicle(id="v9", plate="34 ZAB 567", brand="Audi", model="A4", year=2023, segment="Lüks", transmission="Otomatik", fuel_type="Benzin", daily_rate=2200, color="Siyah", mileage=9000, status="available"),
        Vehicle(id="v10", plate="34 CDE 890", brand="Ford", model="Focus", year=2022, segment="Orta", transmission="Otomatik", fuel_type="Dizel", daily_rate=900, color="Mavi", mileage=42000, status="available"),
    ]
    
    for v in vehicles:
        existing = await db.vehicles.find_one({"id": v.id})
        if not existing:
            await db.vehicles.insert_one(v.dict())
    
    # Sample Customers
    customers = [
        Customer(id="c1", tc_no="12345678901", full_name="Ahmet Yılmaz", email="ahmet@email.com", phone="+90 532 111 2233", address="İstanbul, Kadıköy"),
        Customer(id="c2", tc_no="23456789012", full_name="Mehmet Demir", email="mehmet@email.com", phone="+90 533 222 3344", address="İstanbul, Beşiktaş"),
        Customer(id="c3", tc_no="34567890123", full_name="Ayşe Kaya", email="ayse@email.com", phone="+90 534 333 4455", address="İstanbul, Şişli"),
    ]
    
    for c in customers:
        existing = await db.customers.find_one({"id": c.id})
        if not existing:
            await db.customers.insert_one(c.dict())
    
    # Sample Reservations
    now = datetime.utcnow()
    reservations = [
        Reservation(id="r1", vehicle_id="v1", customer_id="c1", start_date=now, end_date=now + timedelta(days=3), pickup_location="İstanbul Havalimanı", return_location="İstanbul Havalimanı", status="confirmed", total_amount=2550),
        Reservation(id="r2", vehicle_id="v4", customer_id="c2", start_date=now - timedelta(days=2), end_date=now + timedelta(days=1), pickup_location="Sabiha Gökçen", return_location="Sabiha Gökçen", status="delivered", total_amount=8400),
        Reservation(id="r3", vehicle_id="v2", customer_id="c3", start_date=now + timedelta(days=1), end_date=now + timedelta(days=5), pickup_location="Taksim Ofis", return_location="Taksim Ofis", status="confirmed", total_amount=4800),
    ]
    
    for r in reservations:
        existing = await db.reservations.find_one({"id": r.id})
        if not existing:
            await db.reservations.insert_one(r.dict())

# ==================== APP SETUP ====================

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("FleetEase API starting up...")
    # Seed data on startup
    await seed_sample_data()
    logger.info("Sample data seeded")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
