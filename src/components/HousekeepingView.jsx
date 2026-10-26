import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Check,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import requestsService from '../services/requestsService'

export default function HousekeepingView() {
  const [tasks, setTasks] = useState([])
  const [assignees, setAssignees] = useState([])

  useEffect(() => {
    async function loadTasks() {
      try {
        const [res, staffList] = await Promise.all([
          requestsService.listRequests({ category: 'housekeeping' }),
          requestsService.getAssignees().catch(() => []),
        ])
        if (Array.isArray(staffList)) {
          setAssignees(staffList)
        }
        if (res?.items) {
          setTasks(res.items.map((r) => ({
            id: r.id,
            room: `Room ${r.room?.number || 101}`,
            tier: 'Luxury Suite',
            status: r.status,
            priority: r.priority || 'normal',
            assigneeId: r.assignedTo || r.assignee?.id,
            assignee: r.assignee?.name || 'Unassigned',
            progress: r.status === 'done' ? 100 : r.status === 'in_progress' ? 50 : 10,
            checklist: [
              { item: r.description || 'General Housekeeping Service', done: r.status === 'done' },
              { item: 'Empty Smart Dustbin & verify seal closure', done: r.status === 'done' },
              { item: 'Restock luxury Egyptian cotton linens & towels', done: r.status === 'done' },
              { item: 'Audit & replenish minibar refreshments', done: r.status === 'done' },
            ],
            dustbinFill: (r.id * 17) % 75 + 15,
          })))
        }
      } catch (e) {
        console.warn(e)
      }
    }
    loadTasks()
  }, [])

  const handleAssignAttendant = async (taskId, staffId) => {
    try {
      await requestsService.assignRequest(taskId, staffId ? Number(staffId) : null)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                assigneeId: staffId ? Number(staffId) : null,
                assignee: assignees.find((a) => a.id === Number(staffId))?.name || 'Unassigned',
              }
            : t
        )
      )
    } catch (e) {
      console.warn('Assignment failed:', e.message)
    }
  }

  const toggleChecklistItem = (taskId, itemIndex) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newChecklist = [...t.checklist]
          newChecklist[itemIndex].done = !newChecklist[itemIndex].done
          const completedCount = newChecklist.filter((c) => c.done).length
          const progress = Math.round((completedCount / newChecklist.length) * 100)
          return {
            ...t,
            checklist: newChecklist,
            progress,
            status: progress === 100 ? 'cleared' : t.status,
          }
        }
        return t
      })
    )
  }

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            HOUSEKEEPING & ENGINEERING TELEMETRY
          </span>
          <h1 className="headline-xl">
            Housekeeping & Suite Turnover
          </h1>
          <p className="body-md text-[#64748B] mt-1">
            White-glove sanitization audits, floral arrangements, and engineering calibrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-secondary text-xs">
            Download Audit Report
          </button>
          <button className="btn-primary text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Dispatch Inspection</span>
          </button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => {
          const isAlert = task.priority === 'alert'
          const isUrgent = task.priority === 'urgent'
          return (
            <div
              key={task.id}
              className={`hotel-card p-6 border-l-[3px] ${
                isAlert
                  ? 'border-l-[#DC2626]'
                  : isUrgent
                  ? 'border-l-[#F59E0B]'
                  : 'border-l-[#16A34A]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#F1F5F9] mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-lg text-[#0B1F3A]">
                      {task.room}
                    </h3>
                    <span
                      className={`status-chip ${
                        isAlert
                          ? 'status-alert'
                          : isUrgent
                          ? 'status-pending'
                          : 'status-checked-in'
                      }`}
                    >
                      <span className="status-chip-dot" />
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">{task.tier}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#0B1F3A] block">
                    {task.dueTime}
                  </span>
                  <span className="text-[11px] text-[#64748B]">Target Clearance</span>
                </div>
              </div>

              {/* Task Details */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Service Directive:</span>
                  <span className="font-bold text-[#0B1F3A]">{task.type}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Assigned Attendant:</span>
                  <select
                    value={task.assigneeId || ''}
                    onChange={(e) => handleAssignAttendant(task.id, e.target.value)}
                    className="font-medium text-[#0B1F3A] bg-white border border-[#E5E7EB] rounded-lg px-2 py-0.5 text-xs focus:outline-none focus:border-[#C9A227] cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748B]">Turnover Progress:</span>
                    <span className="font-bold text-[#0B1F3A]">{task.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#EEEEEC] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isAlert
                          ? 'bg-[#DC2626]'
                          : isUrgent
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#16A34A]'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* White Glove Checklist (Specification Checkboxes) */}
              <div className="bg-[#F9F9F7] p-4 rounded-xl border border-[#E5E7EB] space-y-2.5">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                  Inspection Protocols Checklist:
                </span>
                {task.checklist.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-3 cursor-pointer group select-none"
                    onClick={() => toggleChecklistItem(task.id, idx)}
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded-[4px] border border-[#CBD5E1] bg-white flex items-center justify-center transition-all ${
                        item.done ? 'bg-[#0B1F3A] border-[#0B1F3A]' : ''
                      }`}
                    >
                      {item.done && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </div>
                    <span
                      className={`text-xs ${
                        item.done
                          ? 'line-through text-[#64748B]'
                          : 'text-[#0B1F3A] font-medium'
                      }`}
                    >
                      {item.item}
                    </span>
                  </label>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex justify-end">
                <button
                  onClick={() => {
                    setTasks((prev) =>
                      prev.map((t) =>
                        t.id === task.id
                          ? {
                              ...t,
                              progress: 100,
                              checklist: t.checklist.map((c) => ({ ...c, done: true })),
                            }
                          : t
                      )
                    )
                  }}
                  className={`btn-secondary text-xs h-9 ${
                    task.progress === 100 ? 'border-[#16A34A] text-[#15803D]' : ''
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>
                    {task.progress === 100 ? 'Suite Cleared & Certified' : 'Mark All Inspected'}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
