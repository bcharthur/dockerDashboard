from dataclasses import dataclass

@dataclass
class SummaryMetrics:
    cpu_pct_total: float
    cpu_pct_max:   int
    cpus:          int
    mem_used:      int    # bytes !
    mem_total:     int

    def as_dict(self):
        return self.__dict__
