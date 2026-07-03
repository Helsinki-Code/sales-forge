"""Small dependency-free client generated from docs/openapi.yaml."""
import json
from urllib.request import Request, urlopen
from urllib.parse import quote

class SEOForge:
    def __init__(self, token: str, base_url: str = "https://app.seoforge.ai"):
        self.token, self.base_url = token, base_url.rstrip("/")
    def _request(self, path: str, method="GET", body=None):
        payload = json.dumps(body).encode() if body is not None else None
        request = Request(f"{self.base_url}/api/v1/{path}", data=payload, method=method, headers={"Authorization":f"Bearer {self.token}","Content-Type":"application/json"})
        with urlopen(request) as response:
            return json.load(response)["data"]
    def sites(self): return self._request("sites")
    def runs(self): return self._request("runs")
    def findings(self): return self._request("findings")
    def proposals(self): return self._request("proposals")
    def rankings(self, site_id=None): return self._request("rankings" + (f"?siteId={quote(site_id)}" if site_id else ""))
    def audit(self, site_id, dry_run=True): return self._request("audits", "POST", {"siteId":site_id,"dryRun":dry_run})
