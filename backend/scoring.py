"""Расчёт очков за ответ: расстояние + бонус за скорость."""
import math


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Расстояние между двумя точками на сфере Земли в километрах.
    Формула гаверсинусов.
    """
    R = 6371  # средний радиус Земли, км

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * R * math.asin(math.sqrt(a))


def calculate_score(distance_km: float, time_spent: float) -> dict:
    """
    Возвращает base_score, time_bonus и final_score.

    base_score = 5000 * exp(-distance / 500)
      - 0 км  → 5000
      - 500 км → ~1840
      - 1000 км → ~680
      - 2000 км → ~90

    time_bonus = 1 + max(0, 15 - time_spent) / 30
      - ответил за 15+ сек → 1.0
      - за 5 сек → 1.33
      - мгновенно → 1.5
    """
    base_score = round(5000 * math.exp(-distance_km / 500))
    time_bonus = 1 + max(0, 15 - time_spent) / 30
    final_score = round(base_score * time_bonus)

    return {
        "base_score": base_score,
        "time_bonus": round(time_bonus, 2),
        "final_score": final_score,
    }