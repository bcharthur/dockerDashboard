# Repository/docker_repository.py
import docker
from Entity.container_metrics import ContainerMetrics
from Entity.summary_metrics   import SummaryMetrics

client = docker.from_env()

def get_snapshot_and_summary():
    rows, total_cpu, total_mem = [], 0, 0
    cpus_max = 0

    for c in client.containers.list():
        m = ContainerMetrics.from_stats(c)
        rows.append(m)
        total_cpu += m.cpu_pct
        total_mem += m.mem_used
        cpus_max   = max(cpus_max, m.cpus)

    # 👉  VM Docker Desktop (Settings → Resources)
    mem_total = client.info().get('MemTotal') or rows[0].mem_lim

    summary = SummaryMetrics(
        cpu_pct_total = round(total_cpu, 2),
        cpu_pct_max   = cpus_max * 100,
        cpus          = cpus_max,
        mem_used      = total_mem,
        mem_total     = mem_total
    )
    return [r.as_dict() for r in rows], summary.as_dict()