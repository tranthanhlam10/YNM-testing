from __future__ import annotations

from dataclasses import dataclass

from .config import JIRA_API_VERSION, JIRA_DEPLOYMENT, JIRA_DESCRIPTION_FORMAT


@dataclass(frozen=True)
class JiraAdapter:
    deployment: str
    api_version: str
    description_format: str

    @property
    def api_prefix(self) -> str:
        return f"/rest/api/{self.api_version}"

    def path(self, resource: str) -> str:
        return f"{self.api_prefix}/{resource.lstrip('/')}"

    def issue_path(self, issue_key: str = "") -> str:
        resource = "issue"
        if issue_key:
            resource += f"/{issue_key}"
        return self.path(resource)

    def issue_link_path(self) -> str:
        return self.path("issueLink")

    def myself_path(self) -> str:
        return self.path("myself")

    def server_info_path(self) -> str:
        return self.path("serverInfo")

    def search_path(self) -> str:
        resource = "search" if self.deployment == "server" else "search/jql"
        return self.path(resource)

    def metadata(self) -> dict[str, str]:
        return {
            "deployment": self.deployment,
            "api_version": self.api_version,
            "description_format": self.description_format,
        }


JIRA_ADAPTER = JiraAdapter(
    deployment=JIRA_DEPLOYMENT,
    api_version=JIRA_API_VERSION,
    description_format=JIRA_DESCRIPTION_FORMAT,
)
