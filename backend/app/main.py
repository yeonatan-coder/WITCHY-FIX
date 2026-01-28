
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
import os

from .storage import ArchiveStore, now_ms, new_id

ARCHIVE_DIR = os.getenv("WITCHY_ARCHIVE_DIR") or os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "Archive"))
AUTH_ENABLED = os.getenv("WITCHY_AUTH_ENABLED", "0") == "1"
store = ArchiveStore(ARCHIVE_DIR)

app = FastAPI(title="Witchy Unified Backend (Archive Mode)")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# -------- Auth --------
class AuthLoginReq(BaseModel):
    email: str
    password: str

class AuthRegisterReq(BaseModel):
    email: str
    password: str
    role: str = "customer"  # admin|owner|customer|idf_customer
    display_name: str = ""

def _token_for_user(u: Dict[str, Any]) -> str:
    if u.get("token"):
        return u["token"]
    u["token"] = f"tok_{u['id']}"
    store.upsert("users", u)
    return u["token"]

def _get_user_by_token(token: str) -> Optional[Dict[str, Any]]:
    if not token: return None
    for u in store.list("users"):
        if u.get("token") == token:
            return u
    return None

def current_user(authorization: Optional[str] = Header(default=None)) -> Optional[Dict[str, Any]]:
    if not AUTH_ENABLED:
        return {"id":"dev_admin", "role":"admin", "email":"dev@local", "display_name":"Dev Admin"}
    if not authorization:
        return None
    token = authorization.split()[-1].strip()
    return _get_user_by_token(token)

def require_role(*roles: str):
    def dep(user: Optional[Dict[str, Any]] = Depends(current_user)):
        if not AUTH_ENABLED:
            return user
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        if roles and user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return dep

# -------- Health / Info --------
@app.get("/healthz")
def healthz():
    return {"status":"ok", "archive_dir": ARCHIVE_DIR, "auth_enabled": AUTH_ENABLED}

@app.get("/api/v2/check/health")
def health_v2():
    return {"ok": True, "ts": now_ms()}

@app.get("/api/v2/system/info")
def system_info():
    return {"name":"Witchy", "mode":"archive", "ts": now_ms()}

# -------- System Settings --------
DEFAULT_SETTINGS = {"order_auto_approve": False}

@app.get("/api/v2/system/settings")
def get_settings(user=Depends(require_role("admin","owner","customer","idf_customer"))):
    return store.get("system_settings", "system") or {"id":"system", **DEFAULT_SETTINGS}

@app.put("/api/v2/system/settings")
def put_settings(payload: Dict[str, Any], user=Depends(require_role("admin"))):
    cur = store.get("system_settings", "system") or {"id":"system", **DEFAULT_SETTINGS}
    cur.update(payload or {})
    store.upsert("system_settings", cur)
    return cur

# -------- Generic CRUD --------
class FindReq(BaseModel):
    where: Dict[str, Any] = Field(default_factory=dict)

@app.post("/api/v2/{resource}/find/")
def generic_find(resource: str, req: FindReq, user=Depends(require_role("admin","owner","customer","idf_customer"))):
    items = store.find(resource, req.where)
    if user.get("role") == "owner" and resource in ("stores","products","categories","orders","stock_movements"):
        uid = user["id"]
        items = [it for it in items if it.get("owner_user_id") in (None, uid)]
    return {"items": items}

@app.get("/api/v2/{resource}/{id}/")
def generic_get(resource: str, id: str, user=Depends(require_role("admin","owner","customer","idf_customer"))):
    it = store.get(resource, id)
    if not it: raise HTTPException(404, "Not found")
    if user.get("role") == "owner" and resource in ("stores","products","categories","orders","stock_movements"):
        if it.get("owner_user_id") not in (None, user["id"]):
            raise HTTPException(403, "Forbidden")
    return it

@app.post("/api/v2/{resource}/")
def generic_post(resource: str, payload: Dict[str, Any], user=Depends(require_role("admin","owner"))):
    if user.get("role") == "owner" and resource in ("stores","products","categories","orders","stock_movements"):
        payload["owner_user_id"] = user["id"]
    return store.upsert(resource, payload)

@app.put("/api/v2/{resource}/{id}/")
def generic_put(resource: str, id: str, payload: Dict[str, Any], user=Depends(require_role("admin","owner"))):
    existing = store.get(resource, id) or {"id": id}
    if user.get("role") == "owner" and resource in ("stores","products","categories","orders","stock_movements"):
        if existing.get("owner_user_id") not in (None, user["id"]):
            raise HTTPException(403, "Forbidden")
        payload["owner_user_id"] = user["id"]
    existing.update(payload or {}); existing["id"] = id
    return store.upsert(resource, existing)

@app.delete("/api/v2/{resource}/{id}/")
def generic_delete(resource: str, id: str, user=Depends(require_role("admin","owner"))):
    existing = store.get(resource, id)
    if not existing: return {"deleted": False}
    if user.get("role") == "owner" and resource in ("stores","products","categories","orders","stock_movements"):
        if existing.get("owner_user_id") not in (None, user["id"]):
            raise HTTPException(403, "Forbidden")
    return {"deleted": store.delete(resource, id)}

# -------- Auth endpoints --------
@app.post("/api/v2/auth/register")
def register(req: AuthRegisterReq):
    if store.find("users", {"email": req.email}):
        raise HTTPException(400, "Email already registered")
    u = {"id": new_id("usr"), "email": req.email, "password": req.password, "role": req.role,
         "display_name": req.display_name or req.email.split("@")[0], "created_at": now_ms()}
    store.upsert("users", u); token = _token_for_user(u)
    return {"token": token, "user": {"id":u["id"], "email":u["email"], "role":u["role"], "display_name":u["display_name"]}}

@app.post("/api/v2/auth/login")
def login(req: AuthLoginReq):
    users = store.find("users", {"email": req.email})
    if not users or users[0].get("password") != req.password:
        raise HTTPException(401, "Bad credentials")
    u = users[0]; token = _token_for_user(u)
    return {"token": token, "user": {"id":u["id"], "email":u["email"], "role":u["role"], "display_name":u.get("display_name","")}}

@app.get("/api/v2/auth/me")
def me(user=Depends(current_user)):
    if AUTH_ENABLED and not user: raise HTTPException(401, "Not authenticated")
    return {"user": user}

# -------- Events & Notifications --------
def _emit_event(kind: str, payload: Dict[str, Any]):
    store.upsert("events", {"id": new_id("evt"), "kind": kind, "payload": payload, "created_at": now_ms()})

def _notify(user_id: str, title: str, body: str, ref: Dict[str, Any] | None = None):
    store.upsert("notifications", {"id": new_id("ntf"), "user_id": user_id, "title": title, "body": body,
                                   "ref": ref or {}, "seen": False, "created_at": now_ms()})

class MarkSeenReq(BaseModel):
    ids: List[str] = Field(default_factory=list)
    all: bool = False

@app.post("/api/v2/notification/find/")
def notif_find(req: FindReq, user=Depends(require_role("admin","owner","customer","idf_customer"))):
    items = store.find("notifications", req.where)
    uid = user["id"]
    items = [n for n in items if n.get("user_id") in (None, uid)]
    items.sort(key=lambda x: x.get("created_at",0), reverse=True)
    return {"items": items}

@app.post("/api/v2/notification/mark_seen")
def notif_mark(req: MarkSeenReq, user=Depends(require_role("admin","owner","customer","idf_customer"))):
    items = store.list("notifications")
    uid = user["id"]
    changed = 0
    for n in items:
        if n.get("user_id") not in (None, uid):
            continue
        if req.all or (n.get("id") in req.ids):
            if not n.get("seen"):
                n["seen"] = True; n["seen_at"] = now_ms(); changed += 1
    store._save_list("notifications", items)
    return {"updated": changed}

# -------- Orders workflow --------
class CreateOrderReq(BaseModel):
    store_id: str
    line_items: List[Dict[str, Any]] = Field(default_factory=list)

@app.post("/api/v2/orders/create")
def create_order(req: CreateOrderReq, user=Depends(require_role("admin","owner","customer","idf_customer"))):
    st = store.get("stores", req.store_id)
    if not st: raise HTTPException(400, "store_id invalid")
    settings = store.get("system_settings", "system") or {"id":"system", **DEFAULT_SETTINGS}
    auto = bool(settings.get("order_auto_approve", False))
    o = {"id": new_id("ord"), "store_id": req.store_id, "owner_user_id": st.get("owner_user_id"),
         "customer_user_id": user["id"], "status": "approved" if auto else "pending",
         "line_items": req.line_items, "created_at": now_ms()}
    store.upsert("orders", o)
    _emit_event("order.created", {"order_id": o["id"], "status": o["status"]})
    if st.get("owner_user_id"):
        _notify(st["owner_user_id"], "New order", f"Order {o['id']} is {o['status']}", {"order_id": o["id"]})
    return o

@app.post("/api/v2/order/{order_id}/approve")
def order_approve(order_id: str, user=Depends(require_role("admin","owner"))):
    o = store.get("orders", order_id)
    if not o: raise HTTPException(404, "Order not found")
    if user.get("role") == "owner" and o.get("owner_user_id") not in (None, user["id"]):
        raise HTTPException(403, "Forbidden")
    o["status"] = "approved"; o["approved_at"] = now_ms(); store.upsert("orders", o)
    _emit_event("order.approved", {"order_id": o["id"]})
    if o.get("customer_user_id"):
        _notify(o["customer_user_id"], "Order approved", f"Order {o['id']} approved", {"order_id": o["id"]})
    return o

@app.post("/api/v2/order/{order_id}/reject")
def order_reject(order_id: str, user=Depends(require_role("admin","owner"))):
    o = store.get("orders", order_id)
    if not o: raise HTTPException(404, "Order not found")
    if user.get("role") == "owner" and o.get("owner_user_id") not in (None, user["id"]):
        raise HTTPException(403, "Forbidden")
    o["status"] = "rejected"; o["rejected_at"] = now_ms(); store.upsert("orders", o)
    _emit_event("order.rejected", {"order_id": o["id"]})
    if o.get("customer_user_id"):
        _notify(o["customer_user_id"], "Order rejected", f"Order {o['id']} rejected", {"order_id": o["id"]})
    return o

# -------- Store Wizard --------
class WizardProduct(BaseModel):
    name: str
    price_cents: int = 0
    currency: str = "ILS"
    stock_qty: int = 0
    low_stock_threshold: int = 3

class WizardCategory(BaseModel):
    name: str
    products: List[WizardProduct] = Field(default_factory=list)

class WizardReq(BaseModel):
    store: Dict[str, Any]
    categories: List[WizardCategory] = Field(default_factory=list)

@app.post("/api/v2/store-wizard")
def store_wizard(req: WizardReq, user=Depends(require_role("admin","owner"))):
    st = dict(req.store or {})
    if user.get("role") == "owner": st["owner_user_id"] = user["id"]
    st.setdefault("id", new_id("store"))
    st = store.upsert("stores", st)

    created_categories, created_products = [], []
    for c in req.categories:
        cat = store.upsert("categories", {"id": new_id("cat"), "store_id": st["id"], "name": c.name, "owner_user_id": st.get("owner_user_id")})
        created_categories.append(cat)
        for p in c.products:
            created_products.append(store.upsert("products", {"id": new_id("prd"), "store_id": st["id"], "category_id": cat["id"], "owner_user_id": st.get("owner_user_id"),
                                                             "name": p.name, "price_cents": p.price_cents, "currency": p.currency,
                                                             "stock_qty": p.stock_qty, "low_stock_threshold": p.low_stock_threshold}))
    _emit_event("store.wizard_created", {"store_id": st["id"]})
    return {"store": st, "categories": created_categories, "products": created_products}

# -------- Seed demo --------
@app.post("/api/v2/seed/demo")
def seed_demo():
    def ensure(email: str, role: str, pw: str):
        ex = store.find("users", {"email": email})
        if ex: return ex[0]
        u = {"id": new_id("usr"), "email": email, "password": pw, "role": role, "display_name": role.title()}
        store.upsert("users", u); _token_for_user(u); return u

    admin = ensure("admin@demo.local", "admin", "admin")
    owner = ensure("owner@demo.local", "owner", "owner")
    cust  = ensure("cust@demo.local", "customer", "cust")

    st = store.upsert("stores", {"id": new_id("store"), "name": "Demo Store", "owner_user_id": owner["id"], "currency":"ILS"})
    cat = store.upsert("categories", {"id": new_id("cat"), "store_id": st["id"], "name":"Burgers", "owner_user_id": owner["id"]})
    p1 = store.upsert("products", {"id": new_id("prd"), "store_id": st["id"], "category_id": cat["id"], "name":"Classic Burger", "price_cents":4500, "currency":"ILS", "stock_qty":20, "low_stock_threshold":5, "owner_user_id": owner["id"]})
    p2 = store.upsert("products", {"id": new_id("prd"), "store_id": st["id"], "category_id": cat["id"], "name":"Cheese Burger", "price_cents":5200, "currency":"ILS", "stock_qty":12, "low_stock_threshold":5, "owner_user_id": owner["id"]})
    return {"users": {"admin":{"email":admin["email"],"password":"admin"}, "owner":{"email":owner["email"],"password":"owner"}, "customer":{"email":cust["email"],"password":"cust"}}, "store": st, "products":[p1,p2]}
