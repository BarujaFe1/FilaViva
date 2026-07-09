from dataclasses import dataclass
from typing import Optional
import numpy as np

from backend.api.schemas import ScenarioConfig


@dataclass
class Appointment:
    appointment_id: int
    day: int
    scheduled_time: float
    arrival_time: float
    service_duration: float
    no_show: bool = False
    walk_in: bool = False
    server_id: Optional[int] = None
    service_start: Optional[float] = None
    service_end: Optional[float] = None
    wait_time: Optional[float] = None
    overtime_flag: bool = False
    sla_breached: bool = False
    abandoned: bool = False


class AppointmentGenerator:
    def __init__(self, config: ScenarioConfig):
        self.config = config
        self.rng = np.random.default_rng(config.seed)
        self._appointment_counter = 0

    def _time_to_minutes(self, time_str: str) -> int:
        h, m = map(int, time_str.split(":"))
        return h * 60 + m

    def _get_opening_minutes(self) -> int:
        return self._time_to_minutes(self.config.opening_time)

    def _get_closing_minutes(self) -> int:
        return self._time_to_minutes(self.config.closing_time)

    def _operating_minutes(self) -> int:
        return self._get_closing_minutes() - self._get_opening_minutes()

    def _num_slots(self) -> int:
        return self._operating_minutes() // self.config.slot_interval_minutes

    def _lognormal_params(self, mean: float, std: float):
        s2 = np.log(1 + std**2 / mean**2)
        mu = np.log(mean) - s2 / 2
        return mu, np.sqrt(s2)

    def _get_slot_weights(self, num_slots: int) -> np.ndarray:
        pattern = self.config.arrival_pattern
        if pattern == "uniform":
            return np.ones(num_slots)
        elif pattern == "peaked_morning":
            return np.linspace(3, 1, num_slots)
        elif pattern == "peaked_afternoon":
            return np.linspace(1, 3, num_slots)
        elif pattern == "double_peak":
            x = np.linspace(0, 1, num_slots)
            weights = 1 + 2 * np.exp(-((x - 0.2) ** 2) / 0.02) + 2 * np.exp(-((x - 0.7) ** 2) / 0.02)
            return weights
        return np.ones(num_slots)

    def _next_id(self) -> int:
        self._appointment_counter += 1
        return self._appointment_counter

    def generate(self) -> list[Appointment]:
        all_appointments: list[Appointment] = []
        opening = self._get_opening_minutes()
        closing = self._get_closing_minutes()
        num_slots = self._num_slots()
        slot_duration = self.config.slot_interval_minutes
        weights = self._get_slot_weights(num_slots)
        weights = weights / weights.sum()

        self._opening = opening
        self._closing = closing

        mu_ln, sigma_ln = self._lognormal_params(
            self.config.avg_service_duration_minutes,
            self.config.service_duration_std,
        )

        for day in range(self.config.days_to_simulate):
            day_appointments = self._generate_day(
                day, opening, num_slots, slot_duration, weights, mu_ln, sigma_ln
            )
            all_appointments.extend(day_appointments)

        return all_appointments

    def _generate_day(
        self,
        day: int,
        opening: int,
        num_slots: int,
        slot_duration: int,
        weights: np.ndarray,
        mu_ln: float,
        sigma_ln: float,
    ) -> list[Appointment]:
        appointments: list[Appointment] = []
        slot_times = [opening + i * slot_duration for i in range(num_slots)]

        base_appointments = num_slots
        extra_appointments = self.rng.poisson(
            self.config.overbooking_rate * num_slots
        )
        total_scheduled = base_appointments + extra_appointments

        slot_indices = self.rng.choice(num_slots, size=total_scheduled, p=weights)

        for idx in slot_indices:
            scheduled_time = slot_times[idx]
            delay = max(0, self.rng.normal(5, 5))
            arrival_time = scheduled_time + delay
            service_duration = float(self.rng.lognormal(mu_ln, sigma_ln))
            no_show = self.rng.random() < self.config.no_show_rate

            app = Appointment(
                appointment_id=self._next_id(),
                day=day,
                scheduled_time=scheduled_time,
                arrival_time=arrival_time,
                service_duration=service_duration,
                no_show=no_show,
                walk_in=False,
            )
            appointments.append(app)

        num_walkins = self.rng.poisson(
            self.config.walk_in_rate * num_slots
        )
        for _ in range(num_walkins):
            arrival_time = self.rng.uniform(opening, opening + self._operating_minutes())
            service_duration = float(self.rng.lognormal(mu_ln, sigma_ln))

            app = Appointment(
                appointment_id=self._next_id(),
                day=day,
                scheduled_time=arrival_time,
                arrival_time=arrival_time,
                service_duration=service_duration,
                no_show=False,
                walk_in=True,
            )
            appointments.append(app)

        return appointments
