import React, { useState } from 'react'
import {
  Sparkles,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Palette,
  Type,
  Square,
  Sliders,
  ShieldCheck,
  Eye,
} from 'lucide-react'

export default function DesignSystemShowcase() {
  const [activeTab, setActiveTab] = useState('components')
  const [demoCheckbox, setDemoCheckbox] = useState(true)
  const [demoRadio, setDemoRadio] = useState('option1')

  const COLOR_PALETTE = [
    { name: 'surface', hex: '#f9f9f7', role: 'Global canvas background' },
    { name: 'surface-container-lowest', hex: '#ffffff', role: 'Elevated cards & modules' },
    { name: 'surface-container-low', hex: '#f4f4f2', role: 'Filter rails & secondary controls' },
    { name: 'surface-container', hex: '#eeeeec', role: 'Tonal separators' },
    { name: 'surface-container-high', hex: '#e8e8e6', role: 'Dividers & borders' },
    { name: 'surface-container-highest', hex: '#e2e3e1', role: 'Deep card borders' },
    { name: 'primary-container (Deep Navy)', hex: '#0b1f3a', role: 'Structural navigation foundation' },
    { name: 'primary (Navy Dark)', hex: '#000615', role: 'Deep brand anchors' },
    { name: 'secondary (Imperial Gold)', hex: '#c9a227', role: 'High-intent conversion buttons' },
    { name: 'secondary-hover', hex: '#b58f1f', role: 'Primary CTA hover state' },
    { name: 'secondary-container', hex: '#fed255', role: 'Warm active highlight' },
    { name: 'status-success (Operational)', hex: '#16a34a', role: 'Checked-in / Clear' },
    { name: 'status-warning (Attention)', hex: '#f59e0b', role: 'Pending turnover / Audit' },
    { name: 'status-alert (Maintenance)', hex: '#dc2626', role: 'Engineering work orders' },
    { name: 'outline', hex: '#75777e', role: 'Muted borders' },
    { name: 'outline-variant', hex: '#c4c6ce', role: 'Subtle separators' },
  ]

  const TYPOGRAPHY_SAMPLES = [
    {
      level: 'headline-xl',
      spec: '36px / 44px • Bold 700 • Letter-spacing: -0.02em',
      sample: 'Serene Hospitality Operations Console',
      className: 'headline-xl',
    },
    {
      level: 'headline-lg',
      spec: '28px / 36px • SemiBold 600 • Letter-spacing: -0.02em',
      sample: 'Presidential Royal Suite Inventory',
      className: 'headline-lg',
    },
    {
      level: 'headline-md',
      spec: '20px / 28px • SemiBold 600 • Letter-spacing: -0.01em',
      sample: 'Daily Guest Register & Arrivals Manifest',
      className: 'headline-md',
    },
    {
      level: 'body-lg',
      spec: '16px / 26px • Regular 400 • Editorial Cadence',
      sample: 'The design system embodies calm luxury hospitality, prioritizing spatial poise over visual noise.',
      className: 'body-lg text-[#44474D]',
    },
    {
      level: 'body-md',
      spec: '14px / 22px • Regular 400 • Standard Administrative Data',
      sample: 'Flight AF1142 landed at Nice Aerocenter. Chauffeur dispatched for tarmac VIP greeting.',
      className: 'body-md text-[#44474D]',
    },
    {
      level: 'label-lg',
      spec: '14px / 20px • SemiBold 600 • Letter-spacing: +0.01em',
      sample: 'Executive Room Allocation Protocol',
      className: 'label-lg text-[#0B1F3A]',
    },
    {
      level: 'label-sm',
      spec: '11px / 14px • Bold 700 • Letter-spacing: +0.05em • Uppercase',
      sample: 'VIP TIER I (AMBASSADOR PROTOCOL)',
      className: 'label-sm text-[#7587A7]',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
          SERENE HOSPITALITY DESIGN TOKENS
        </span>
        <h1 className="headline-xl">
          Design System & Specification
        </h1>
        <p className="body-md text-[#64748B] mt-1">
          Complete documentation of typography scales, tonal palettes, ambient elevation shadows, and component states.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'components'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          Interactive Component Library
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'colors'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          Color Tokens & Hues
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'typography'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          Typography Cadence
        </button>
        <button
          onClick={() => setActiveTab('elevation')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'elevation'
              ? 'bg-[#0B1F3A] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#0B1F3A]'
          }`}
        >
          Tonal Elevation & Shadows
        </button>
      </div>

      {/* Tab: Components */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          {/* Action Buttons */}
          <div className="hotel-card">
            <h3 className="headline-md mb-2">Button Architecture</h3>
            <p className="text-xs text-[#64748B] mb-5">
              Strictly hierarchical button states: Primary Imperial Gold (#C9A227), Secondary Navy 1px border (#0B1F3A), and Ghost text-only.
            </p>

            <div className="flex flex-wrap items-center gap-4 p-6 bg-[#F9F9F7] rounded-xl border border-[#E5E7EB]">
              {/* Primary */}
              <button className="btn-primary">
                <Sparkles className="w-4 h-4" />
                <span>Primary Action (Imperial Gold)</span>
              </button>

              {/* Secondary */}
              <button className="btn-secondary">
                <ShieldCheck className="w-4 h-4" />
                <span>Secondary Action (Crisp Navy)</span>
              </button>

              {/* Ghost */}
              <button className="btn-ghost">
                <span>Ghost Text Action</span>
              </button>
            </div>
          </div>

          {/* Status Chips */}
          <div className="hotel-card">
            <h3 className="headline-md mb-2">Status Chips & Micro-Badges</h3>
            <p className="text-xs text-[#64748B] mb-5">
              Pill-shaped (9999px), padding 4px 10px, label-sm typography (11px / 14px bold), 6px solid indicator dot.
            </p>

            <div className="flex flex-wrap items-center gap-4 p-6 bg-[#F9F9F7] rounded-xl border border-[#E5E7EB]">
              {/* Checked-In */}
              <span className="status-chip status-checked-in">
                <span className="status-chip-dot" />
                Operational / Checked-In
              </span>

              {/* Pending */}
              <span className="status-chip status-pending">
                <span className="status-chip-dot" />
                Pending / Attention
              </span>

              {/* Alert */}
              <span className="status-chip status-alert">
                <span className="status-chip-dot" />
                Alert / Maintenance
              </span>
            </div>
          </div>

          {/* Form Controls: Inputs, Checkboxes, Radios */}
          <div className="hotel-card">
            <h3 className="headline-md mb-2">Form Controls & Inputs</h3>
            <p className="text-xs text-[#64748B] mb-5">
              Inputs: 44px standard touch target, 8px radius, border #D1D5DB, Navy focus with 3px outer halo. Checkboxes: 18x18px (4px radius). Radios: 18x18px circular with Navy solid dot.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#F9F9F7] rounded-xl border border-[#E5E7EB]">
              {/* Input */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">
                  Standard Input Field (44px)
                </label>
                <input
                  type="text"
                  placeholder="Enter guest or suite identifier..."
                  className="hotel-input"
                />
              </div>

              {/* Checkbox */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">
                  Custom Checkbox (18x18px, 4px radius)
                </label>
                <label
                  onClick={() => setDemoCheckbox(!demoCheckbox)}
                  className="flex items-center gap-3 cursor-pointer pt-2 select-none"
                >
                  <div
                    className={`w-[18px] h-[18px] rounded-[4px] border border-[#CBD5E1] bg-white flex items-center justify-center transition-all ${
                      demoCheckbox ? 'bg-[#0B1F3A] border-[#0B1F3A]' : ''
                    }`}
                  >
                    {demoCheckbox && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#0B1F3A]">
                    Enable 24/7 Diplomatic Courier
                  </span>
                </label>
              </div>

              {/* Radio */}
              <div>
                <label className="block text-xs font-bold text-[#0B1F3A] uppercase tracking-wider mb-2">
                  Custom Radio Button (18x18px)
                </label>
                <div className="space-y-2 pt-1">
                  <label
                    onClick={() => setDemoRadio('option1')}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <div className="w-[18px] h-[18px] rounded-full border border-[#CBD5E1] flex items-center justify-center bg-white">
                      {demoRadio === 'option1' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0B1F3A]" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#0B1F3A]">
                      Direct Butler Line
                    </span>
                  </label>

                  <label
                    onClick={() => setDemoRadio('option2')}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <div className="w-[18px] h-[18px] rounded-full border border-[#CBD5E1] flex items-center justify-center bg-white">
                      {demoRadio === 'option2' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0B1F3A]" />
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#0B1F3A]">
                      Central Concierge Desk
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Colors */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {COLOR_PALETTE.map((color) => (
            <div
              key={color.name}
              className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-xs"
            >
              <div
                className="h-20 w-full border-b border-black/5"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-3">
                <span className="text-xs font-bold text-[#0B1F3A] block truncate">
                  {color.name}
                </span>
                <span className="text-[11px] font-mono text-[#64748B] block mt-0.5">
                  {color.hex}
                </span>
                <p className="text-[10px] text-[#7587A7] mt-1 line-clamp-1">
                  {color.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Typography */}
      {activeTab === 'typography' && (
        <div className="space-y-6">
          {TYPOGRAPHY_SAMPLES.map((item) => (
            <div key={item.level} className="hotel-card">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-3">
                <span className="label-sm text-[#0B1F3A]">{item.level}</span>
                <span className="text-xs font-mono text-[#7587A7]">{item.spec}</span>
              </div>
              <p className={item.className}>{item.sample}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Elevation */}
      {activeTab === 'elevation' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB]/60 p-6 shadow-[0_2px_8px_-2px_rgba(11,31,58,0.04),0_1px_4px_-1px_rgba(11,31,58,0.02)]">
            <span className="label-sm text-[#0B1F3A] block mb-2">Level 1 Elevation</span>
            <p className="text-xs text-[#64748B] mb-4">
              Standard card and section containers. Ambient navy shadow (4% opacity).
            </p>
            <div className="text-[11px] font-mono bg-[#F9F9F7] p-2 rounded text-[#64748B]">
              rgba(11, 31, 58, 0.04)
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB]/60 p-6 shadow-[0_8px_24px_-4px_rgba(11,31,58,0.07),0_4px_8px_-2px_rgba(11,31,58,0.03)]">
            <span className="label-sm text-[#0B1F3A] block mb-2">Level 2 Elevation</span>
            <p className="text-xs text-[#64748B] mb-4">
              Hover states, dropdown menus, and active tooltips.
            </p>
            <div className="text-[11px] font-mono bg-[#F9F9F7] p-2 rounded text-[#64748B]">
              rgba(11, 31, 58, 0.07)
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E5E7EB]/60 p-6 shadow-[0_20px_40px_-8px_rgba(11,31,58,0.12),0_8px_16px_-4px_rgba(11,31,58,0.04)]">
            <span className="label-sm text-[#0B1F3A] block mb-2">Level 3 Elevation</span>
            <p className="text-xs text-[#64748B] mb-4">
              Modals and slide-over sheets. Authoritative deep elevation.
            </p>
            <div className="text-[11px] font-mono bg-[#F9F9F7] p-2 rounded text-[#64748B]">
              rgba(11, 31, 58, 0.12)
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
