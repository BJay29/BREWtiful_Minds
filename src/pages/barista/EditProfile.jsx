import { useState } from 'react'
import { useStore } from '../../context/StoreContext'
import AppShell from '../../components/AppShell'
import AvatarUpload from '../../components/AvatarUpload'
import BaristaAvailability from '../../components/BaristaAvailability'
import BaristaPaymentForm from '../../components/BaristaPaymentForm'
import LocationPicker from '../../components/LocationPicker'
import PageHeader from '../../components/PageHeader'
import PortfolioManager from '../../components/PortfolioManager'
import SectionBoundary from '../../components/SectionBoundary'
import Spinner from '../../components/Spinner'
import { baristaNav } from '../../lib/nav'
import { btnPrimary, card, inputClass, labelClass, sectionTitle, textareaClass } from '../../lib/ui'

const SKILLS = ['Latte art', 'Espresso', 'Cold brew', 'Manual brew', 'Pour over']

function ProfileForm() {
  const { myBarista, saveMyBarista } = useStore()

  const [form, setForm] = useState({
    bio: myBarista?.bio ?? '',
    years: myBarista?.years ?? '',
    cafe: myBarista?.cafe ?? '',
    city: myBarista?.city ?? '',
    schedule: myBarista?.schedule ?? '',
    skills: myBarista?.skills ?? [],
    drinks: (myBarista?.drinks ?? []).join(', '),
    openForEvents: myBarista?.openForEvents ?? true,
  })
  const [place, setPlace] = useState({
    address: myBarista?.address ?? '',
    lat: myBarista?.latitude ?? null,
    lng: myBarista?.longitude ?? null,
  })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  function toggleSkill(skill) {
    set(
      'skills',
      form.skills.includes(skill)
        ? form.skills.filter((s) => s !== skill)
        : [...form.skills, skill]
    )
  }

  function handleLocation(v) {
    setPlace({ address: v.address, lat: v.lat, lng: v.lng })
    if (v.place) set('city', v.place)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setSaving(true)
    const ok = await saveMyBarista({
      bio: form.bio,
      years: Number(form.years) || 0,
      cafe: form.cafe,
      city: form.city,
      schedule: form.schedule,
      skills: form.skills,
      drinks: form.drinks
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      openForEvents: form.openForEvents,
      address: place.address,
      latitude: place.lat,
      longitude: place.lng,
    })
    setSaving(false)
    if (ok) setMessage('Profile saved.')
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Edit barista profile"
        subtitle="This is what customers see."
        back="/barista/profile"
      />

      <SectionBoundary name="Profile photo">
        <AvatarUpload />
      </SectionBoundary>

      <SectionBoundary name="Portfolio">
        <PortfolioManager />
      </SectionBoundary>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <section className={`${card} flex flex-col gap-4 p-5`}>
          <h2 className={sectionTitle}>About you</h2>
          <label className={labelClass}>
            About me
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              placeholder="Tell customers about yourself"
              className={textareaClass}
            />
          </label>
          <label className={labelClass}>
            Years of experience
            <input
              type="number"
              min="0"
              value={form.years}
              onChange={(e) => set('years', e.target.value)}
              className={inputClass}
            />
          </label>
        </section>

        <section className={`${card} flex flex-col gap-4 p-5`}>
          <h2 className={sectionTitle}>Where to find you</h2>
          <label className={labelClass}>
            Cafe where I work now
            <input
              value={form.cafe}
              onChange={(e) => set('cafe', e.target.value)}
              className={inputClass}
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#2B1A12]">Cafe location</p>
            <SectionBoundary name="Cafe location map">
              <LocationPicker
                value={place}
                onChange={handleLocation}
                placeholder="Search your cafe address"
              />
            </SectionBoundary>
          </div>

          <label className={labelClass}>
            City / Barangay
            <input
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className={inputClass}
            />
            <span className="text-xs font-normal text-stone-500">
              Filled in automatically when you pin your location. You can edit it.
            </span>
          </label>
          <label className={labelClass}>
            My schedule
            <input
              value={form.schedule}
              onChange={(e) => set('schedule', e.target.value)}
              placeholder="Mon-Fri, 8AM-4PM"
              className={inputClass}
            />
          </label>
        </section>

        <section className={`${card} flex flex-col gap-4 p-5`}>
          <h2 className={sectionTitle}>Skills and drinks</h2>
          <div>
            <p className="mb-2 text-sm font-semibold text-[#2B1A12]">Skills</p>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  aria-pressed={form.skills.includes(skill)}
                  className={`h-10 rounded-full border px-5 text-sm font-semibold transition duration-200 active:scale-95 ${
                    form.skills.includes(skill)
                      ? 'border-[#3B2316] bg-[#3B2316] text-[#F6E9D8] shadow-sm'
                      : 'border-[#E2D3C2] bg-white text-[#2B1A12] hover:border-[#B8742F]'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <label className={labelClass}>
            Signature drinks (separate with commas)
            <input
              value={form.drinks}
              onChange={(e) => set('drinks', e.target.value)}
              placeholder="Spanish latte, Flat white"
              className={inputClass}
            />
          </label>
        </section>

        <section className={`${card} flex items-center justify-between gap-4 p-5`}>
          <div>
            <p className="font-semibold text-[#2B1A12]">Open for event bookings</p>
            <p className="text-xs text-stone-500">Customers can send you booking requests.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.openForEvents}
            onClick={() => set('openForEvents', !form.openForEvents)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
              form.openForEvents ? 'bg-[#3B2316]' : 'bg-stone-300'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
                form.openForEvents ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </section>

        {message && (
          <p className="animate-fade-in rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>
        )}

        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving && <Spinner />}
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <SectionBoundary name="Availability">
        <BaristaAvailability />
      </SectionBoundary>

      <SectionBoundary name="Payment">
        <BaristaPaymentForm />
      </SectionBoundary>
    </div>
  )
}

export default function EditProfile() {
  return (
    <AppShell items={baristaNav}>
      <ProfileForm />
    </AppShell>
  )
}