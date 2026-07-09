import numpy as np

from backend.api.schemas import ScenarioConfig
from backend.engine.generator import Appointment


class Simulator:
    def __init__(self, config: ScenarioConfig):
        self.config = config

    @staticmethod
    def _time_to_minutes(time_str: str) -> int:
        h, m = map(int, time_str.split(":"))
        return h * 60 + m

    def run(self, appointments: list[Appointment]) -> list[Appointment]:
        opening = self._time_to_minutes(self.config.opening_time)
        closing = self._time_to_minutes(self.config.closing_time)
        num_servers = self.config.num_servers
        sla_threshold = self.config.sla_wait_minutes
        abandon_threshold = self.config.abandonment_threshold_minutes

        days: dict[int, list[Appointment]] = {}
        for app in appointments:
            days.setdefault(app.day, []).append(app)

        for day in sorted(days.keys()):
            day_apps = days[day]
            servers = np.full(num_servers, opening, dtype=float)
            day_apps.sort(key=lambda a: a.arrival_time)

            for app in day_apps:
                if app.no_show:
                    continue

                server_idx = int(np.argmin(servers))
                next_available = servers[server_idx]

                wait_time = max(0, next_available - app.arrival_time)
                app.wait_time = wait_time

                if wait_time > abandon_threshold:
                    app.abandoned = True
                    continue

                service_start = max(app.arrival_time, next_available)
                service_end = service_start + app.service_duration

                app.service_start = service_start
                app.service_end = service_end
                app.server_id = server_idx

                servers[server_idx] = service_end

                if service_end > closing:
                    app.overtime_flag = True

                if wait_time > sla_threshold:
                    app.sla_breached = True

        return appointments
