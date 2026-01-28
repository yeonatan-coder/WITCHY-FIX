
import json, os, time, uuid
from typing import Any, Dict, List, Optional

def now_ms() -> int:
    return int(time.time() * 1000)

def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

class ArchiveStore:
    """File-based storage (Archive Mode). Hardened against bad shapes."""
    def __init__(self, archive_dir: str):
        self.archive_dir = archive_dir
        os.makedirs(self.archive_dir, exist_ok=True)

    def _path(self, resource: str) -> str:
        return os.path.join(self.archive_dir, f"{resource}.json")

    def _load_raw(self, resource: str) -> Any:
        p = self._path(resource)
        if not os.path.exists(p):
            return []
        try:
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _load_list(self, resource: str) -> List[Dict[str, Any]]:
        raw = self._load_raw(resource)
        if isinstance(raw, list):
            return [x for x in raw if isinstance(x, dict)]
        if isinstance(raw, dict):
            return [raw]
        return []

    def _save_list(self, resource: str, items: List[Dict[str, Any]]) -> None:
        p = self._path(resource)
        tmp = p + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        os.replace(tmp, p)

    def list(self, resource: str) -> List[Dict[str, Any]]:
        return self._load_list(resource)

    def get(self, resource: str, _id: str) -> Optional[Dict[str, Any]]:
        for it in self._load_list(resource):
            if it.get("id") == _id:
                return it
        return None

    def upsert(self, resource: str, item: Dict[str, Any]) -> Dict[str, Any]:
        items = self._load_list(resource)
        _id = item.get("id")
        if not _id:
            item["id"] = new_id(resource)
            item["created_at"] = now_ms()
            _id = item["id"]
        item["updated_at"] = now_ms()
        out = []
        replaced = False
        for it in items:
            if it.get("id") == _id:
                out.append(item); replaced = True
            else:
                out.append(it)
        if not replaced:
            out.append(item)
        self._save_list(resource, out)
        return item

    def delete(self, resource: str, _id: str) -> bool:
        items = self._load_list(resource)
        out = [it for it in items if it.get("id") != _id]
        changed = len(out) != len(items)
        if changed:
            self._save_list(resource, out)
        return changed

    def find(self, resource: str, where: Dict[str, Any] | None = None) -> List[Dict[str, Any]]:
        where = where or {}
        items = self._load_list(resource)
        def ok(it: Dict[str, Any]) -> bool:
            for k, v in where.items():
                if it.get(k) != v:
                    return False
            return True
        return [it for it in items if ok(it)]
