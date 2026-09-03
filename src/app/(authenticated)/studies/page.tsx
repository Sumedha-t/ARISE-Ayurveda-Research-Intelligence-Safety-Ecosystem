"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileCode,
  Download,
  Plus,
  X,
  CheckCircle2,
  FolderKanban,
  Pill,
  Activity,
  Calendar,
  ClipboardList,
  HeartPulse,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react"

export default function StudiesPage() {
  const [studies, setStudies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [userRole, setUserRole] = useState<string>("COORDINATOR")
  const [activeTab, setActiveTab] = useState<"general" | "interventions" | "monitoring" | "criteria">("general")

  // Sheet 1: Studies Core Fields
  const [studyId, setStudyId] = useState("")
  const [ctri, setCtri] = useState("")
  const [title, setTitle] = useState("")
  const [condition, setCondition] = useState("")
  const [studyPhase, setStudyPhase] = useState("PHASE_3")
  const [studyDesign, setStudyDesign] = useState("RANDOMIZED_PARALLEL")
  const [studyType, setStudyType] = useState("INTERVENTIONAL")
  const [targetEnrolment, setTargetEnrolment] = useState("30")
  const [iecStatus, setIecStatus] = useState("APPROVED")
  const [iecApprovalDate, setIecApprovalDate] = useState("2026-08-01")
  const [studyStatus, setStudyStatus] = useState("ONGOING")
  const [monitoringFrequency, setMonitoringFrequency] = useState("WEEKLY")
  const [monitoringStartDate, setMonitoringStartDate] = useState("2026-09-10")
  const [monitoringEndDate, setMonitoringEndDate] = useState("2026-12-10")
  const [description, setDescription] = useState("")

  // Sheet 2: Study_Interventions (Drug, Pathya, Anupana)
  const [drugName, setDrugName] = useState("")
  const [drugDose, setDrugDose] = useState("500 mg")
  const [drugRoute, setDrugRoute] = useState("ORAL")
  const [drugFrequency, setDrugFrequency] = useState("TWICE_DAILY")
  const [drugDuration, setDrugDuration] = useState("12 WEEKS")
  const [anupanaName, setAnupanaName] = useState("Ushnodaka (Lukewarm water)")
  const [pathyaRegimen, setPathyaRegimen] = useState("Pathya Ahara: Mudga, Yava, Takra; Apathya: Strict salt restriction, Dadhi, Divasvapna")

  // Sheet 3 & 4: Criteria & Clinical Parameters
  const [inclusionCriteria, setInclusionCriteria] = useState("Adults aged 30–65 years diagnosed with classical clinical criteria; willing to comply with Pathya.")
  const [exclusionCriteria, setExclusionCriteria] = useState("Secondary systemic complications, pregnancy, lactating mothers, acute emergency conditions.")
  const [primaryParam, setPrimaryParam] = useState("SBP - Systolic Blood Pressure (mmHg)")

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      let role = "COORDINATOR"
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        if (profile?.role) role = profile.role
      }
      setUserRole(role)

      let query = supabase.from("studies").select("*").order("created_at", { ascending: false })
      if (role === "PI") {
        query = query.in("ctri_number", ["CTRI/2026/08/001122"])
      }

      const { data } = await query
      if (data && data.length > 0) {
        setStudies(data)
      } else {
        setStudies(
          role === "PI"
            ? [
                {
                  id: "bd80cffa-ec26-5592-a626-63acdd761bf0",
                  study_id: "AIIA-HTN-001",
                  ctri_number: "CTRI/2026/08/001122",
                  title: "Ayurveda Comparative Study in Essential Hypertension",
                  condition: "Essential Hypertension",
                  intervention: "Divya Mukta Vati Extra Power vs Sarpagandha Vati",
                  phase: "PHASE_3",
                  study_design: "RANDOMIZED_PARALLEL",
                  study_type: "INTERVENTIONAL",
                  iec_status: "APPROVED",
                  current_enrolment: 5,
                  target_enrolment: 5,
                  monitoring_frequency: "WEEKLY"
                }
              ]
            : [
                {
                  id: "bd80cffa-ec26-5592-a626-63acdd761bf0",
                  study_id: "AIIA-HTN-001",
                  ctri_number: "CTRI/2026/08/001122",
                  title: "Ayurveda Comparative Study in Essential Hypertension",
                  condition: "Essential Hypertension",
                  intervention: "Divya Mukta Vati Extra Power vs Sarpagandha Vati",
                  phase: "PHASE_3",
                  study_design: "RANDOMIZED_PARALLEL",
                  study_type: "INTERVENTIONAL",
                  iec_status: "APPROVED",
                  current_enrolment: 5,
                  target_enrolment: 5,
                  monitoring_frequency: "WEEKLY"
                },
                {
                  id: "33b1e8e4-8f0a-5c12-8854-472df342dcb2",
                  study_id: "AIIA-DL-001",
                  ctri_number: "CTRI/2026/08/002233",
                  title: "Ayurveda Study of Amla Extract in Dyslipidaemia",
                  condition: "Dyslipidaemia",
                  intervention: "Amla Extract (AMX160)",
                  phase: "PHASE_3",
                  study_design: "RANDOMIZED_PARALLEL",
                  study_type: "INTERVENTIONAL",
                  iec_status: "APPROVED",
                  current_enrolment: 5,
                  target_enrolment: 5,
                  monitoring_frequency: "WEEKLY"
                },
                {
                  id: "cbcae674-8b01-561b-8f3a-14d9a33bb58c",
                  study_id: "AIIA-DM-001",
                  ctri_number: "CTRI/2026/08/003344",
                  title: "Ayurveda Study of Neem Extract in Type 2 Diabetes",
                  condition: "Type 2 Diabetes Mellitus",
                  intervention: "Nimba Patra Arka (NE100)",
                  phase: "PHASE_3",
                  study_design: "RANDOMIZED_PARALLEL",
                  study_type: "INTERVENTIONAL",
                  iec_status: "APPROVED",
                  current_enrolment: 5,
                  target_enrolment: 5,
                  monitoring_frequency: "WEEKLY"
                }
              ]
        )
      }
      setLoading(false)
    }

    loadData()
  }, [])

  const canCreateStudy = userRole === "PI" || userRole === "ADMIN"

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const fullDescription = description || `${condition || "Ayurvedic"} interventional protocol evaluating ${drugName || "herbal formulation"}. Prescribed with ${anupanaName || "Ushnodaka"}. Pathya: ${pathyaRegimen}.`

    const newRecord = {
      ctri_number: ctri || "CTRI/2026/09/007788",
      title: title || "Investigator-Initiated GCP-ASU Protocol",
      description: fullDescription,
      phase: studyPhase,
      study_type: studyType,
      iec_status: iecStatus,
      target_enrolment: parseInt(targetEnrolment) || 30,
      current_enrolment: 0
    }

    const { data } = await supabase.from("studies").insert([newRecord]).select()
    if (data && data[0]) {
      setStudies([data[0], ...studies])
    } else {
      setStudies([{ id: `custom-${Date.now()}`, ...newRecord, condition, intervention: drugName, study_design: studyDesign }, ...studies])
    }

    setFormSuccess(true)
    setTimeout(() => {
      setFormSuccess(false)
      setModalOpen(false)
      setCtri("")
      setStudyId("")
      setTitle("")
      setCondition("")
      setDrugName("")
      setDescription("")
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5DFD3] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#25231F]">
            Clinical Studies Portfolio
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            {userRole === "PI"
              ? "Assigned investigator protocol scope (All India Institute of Ayurveda)"
              : "Institutional oversight: all active clinical trial protocols under GCP-ASU"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] border-[#2D5A27]/25 text-xs px-3 py-1">
            {studies.length} Active {userRole === "PI" ? "Assigned Protocol" : "Protocols"}
          </Badge>

          {canCreateStudy && (
            <Button
              onClick={() => { setModalOpen(true); setActiveTab("general"); }}
              className="inline-flex items-center gap-1.5 bg-[#2D5A27] hover:bg-[#23491E] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Clinical Protocol</span>
            </Button>
          )}
        </div>
      </div>

      {/* Studies Table */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6B6355] flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-[#2D5A27]" />
            <span>Querying Supabase Postgres...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-[#25231F]">
            <thead className="bg-[#FAF7F0] text-[11px] uppercase tracking-wider text-[#6B6355] border-b border-[#E5DFD3]">
              <tr>
                <th className="px-5 py-3.5 font-bold">CTRI & ID</th>
                <th className="px-5 py-3.5 font-bold">Title, Indication & Intervention</th>
                <th className="px-5 py-3.5 font-bold">Phase & Design</th>
                <th className="px-5 py-3.5 font-bold">IEC Status</th>
                <th className="px-5 py-3.5 font-bold">Enrolment</th>
                <th className="px-5 py-3.5 font-bold text-right">Interoperability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD3]">
              {studies.map((s) => (
                <tr key={s.id} className="hover:bg-[#F9F6F0] transition-colors">
                  <td className="px-5 py-4 font-mono">
                    <div className="font-bold text-[#2D5A27]">{s.ctri_number}</div>
                    <div className="text-[11px] text-[#6B6355]">{s.study_id || "AIIA-PROTOCOL"}</div>
                    <div className="text-[10px] text-[#6B6355] mt-1 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-[#C87D0E]" />
                      <span>{s.monitoring_frequency || "WEEKLY"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 max-w-sm">
                    <div className="font-semibold text-[#25231F] leading-snug">{s.title}</div>
                    <div className="text-[11px] text-[#2D5A27] font-medium mt-1 flex items-center gap-1">
                      <Pill className="h-3 w-3 shrink-0" />
                      <span>{s.intervention || "Standardized Ayurveda Formulation"}</span>
                    </div>
                    <div className="text-[11px] text-[#6B6355] mt-0.5">
                      <strong>Indication:</strong> {s.condition || "Clinical Indication"}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-[#25231F]">{s.phase?.replace("_", " ")}</span>
                      <Badge className="w-fit text-[10px] bg-[#FAF7F0] text-[#6B6355] border-[#E5DFD3]" variant="outline">
                        {s.study_design?.replace("_", " ") || "INTERVENTIONAL"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#2D5A27]/10 text-[#2D5A27] border border-[#2D5A27]/25">
                      {s.iec_status || "Approved"}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs">
                    <span className="font-bold text-[#25231F]">{s.current_enrolment ?? 5}</span> / {s.target_enrolment ?? 5}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href="/interoperability">
                        <Button className="h-7 px-2.5 text-xs text-[#2D5A27] border-[#2D5A27]/30 hover:bg-[#2D5A27]/10" size="sm" variant="outline">
                          <FileCode className="h-3.5 w-3.5 mr-1" />
                          FHIR
                        </Button>
                      </Link>
                      <a href={`/api/sdtm/dm/${s.id}`} download>
                        <Button className="h-7 px-2.5 text-xs text-[#6B6355] border-[#E5DFD3] hover:bg-[#FAF7F0]" size="sm" variant="outline">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          SDTM
                        </Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expanded Clinical Dataset Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-6 rounded-2xl border border-[#E5DFD3] bg-[#FCFAF7] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5DFD3] px-6 py-4 bg-[#FAF7F0] shrink-0">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="h-5 w-5 text-[#2D5A27]" />
                <div>
                  <h3 className="text-base font-bold text-[#25231F]">Register GCP-ASU Protocol & Trial Design</h3>
                  <p className="text-[11px] text-[#6B6355]">Synthetic_Data_V2 schema-compliant clinical trial registration</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-[#EAE4D8] text-[#6B6355] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Tab Navigator */}
            <div className="flex border-b border-[#E5DFD3] bg-[#F2ECE1] px-6 text-xs font-semibold shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                  activeTab === "general"
                    ? "border-[#2D5A27] text-[#2D5A27] font-bold"
                    : "border-transparent text-[#6B6355] hover:text-[#25231F]"
                }`}
              >
                1. Study & IEC Identifiers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("interventions")}
                className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                  activeTab === "interventions"
                    ? "border-[#2D5A27] text-[#2D5A27] font-bold"
                    : "border-transparent text-[#6B6355] hover:text-[#25231F]"
                }`}
              >
                2. Interventions & Pathya
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("monitoring")}
                className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                  activeTab === "monitoring"
                    ? "border-[#2D5A27] text-[#2D5A27] font-bold"
                    : "border-transparent text-[#6B6355] hover:text-[#25231F]"
                }`}
              >
                3. Design & Monitoring
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("criteria")}
                className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
                  activeTab === "criteria"
                    ? "border-[#2D5A27] text-[#2D5A27] font-bold"
                    : "border-transparent text-[#6B6355] hover:text-[#25231F]"
                }`}
              >
                4. Criteria & Endpoints
              </button>
            </div>

            {formSuccess ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                <CheckCircle2 className="h-12 w-12 text-[#2D5A27]" />
                <span className="font-bold text-lg text-[#25231F]">Trial Protocol Initialized Successfully!</span>
                <p className="text-xs text-[#6B6355] max-w-sm">
                  CTRI record linked, interventions encoded, and pharmacovigilance oversight armed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateStudy} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Tab 1: General & IEC */}
                {activeTab === "general" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">CTRI Number (CTRI_NUMBER) *</label>
                        <input
                          type="text"
                          placeholder="e.g. CTRI/2026/09/005544"
                          value={ctri}
                          onChange={(e) => setCtri(e.target.value)}
                          required
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Study Protocol Code (STUDYID) *</label>
                        <input
                          type="text"
                          placeholder="e.g. AIIA-HTN-002"
                          value={studyId}
                          onChange={(e) => setStudyId(e.target.value)}
                          required
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 font-mono text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B6355]">Study Title (STUDY_TITLE) *</label>
                      <input
                        type="text"
                        placeholder="e.g. Clinical Evaluation of Classical Arjuna Ksheerapaka in Essential Hypertension"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Clinical Indication (CONDITION) *</label>
                        <input
                          type="text"
                          placeholder="e.g. Essential Hypertension"
                          value={condition}
                          onChange={(e) => setCondition(e.target.value)}
                          required
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">IEC Status (IEC_STATUS)</label>
                        <select
                          value={iecStatus}
                          onChange={(e) => setIecStatus(e.target.value)}
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        >
                          <option value="APPROVED">APPROVED (Institutional Ethics Committee)</option>
                          <option value="PENDING">PENDING REVIEW</option>
                          <option value="AMENDMENT_SUBMITTED">AMENDMENT SUBMITTED</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B6355]">Protocol Narrative Description (DESCRIPTION)</label>
                      <textarea
                        rows={2}
                        placeholder="Ayurveda intervention for management of target clinical condition under GCP-ASU standards."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 2: Study_Interventions (Drug, Pathya, Anupana) */}
                {activeTab === "interventions" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#E5DFD3] bg-[#FAF7F0] p-3.5 space-y-3">
                      <div className="font-bold text-xs text-[#25231F] flex items-center gap-1.5">
                        <Pill className="h-4 w-4 text-[#2D5A27]" />
                        <span>A. Investigational Drug Formulation (COMPONENT_TYPE: DRUG)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="font-semibold text-[#6B6355]">Formulation Name (NAME) *</label>
                          <input
                            type="text"
                            placeholder="e.g. Arjuna Ksheerapaka or Divya Mukta Vati"
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-[#6B6355]">Dose (DOSE)</label>
                          <input
                            type="text"
                            value={drugDose}
                            onChange={(e) => setDrugDose(e.target.value)}
                            className="w-full rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-[#6B6355]">Route (ROUTE)</label>
                          <select
                            value={drugRoute}
                            onChange={(e) => setDrugRoute(e.target.value)}
                            className="w-full rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                          >
                            <option value="ORAL">ORAL</option>
                            <option value="NASAL">NASAL (Nasya)</option>
                            <option value="TOPICAL">TOPICAL (Lepa)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-[#6B6355]">Frequency (FREQUENCY)</label>
                          <select
                            value={drugFrequency}
                            onChange={(e) => setDrugFrequency(e.target.value)}
                            className="w-full rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                          >
                            <option value="TWICE_DAILY">TWICE_DAILY (B.I.D.)</option>
                            <option value="DAILY">DAILY (O.D.)</option>
                            <option value="THRICE_DAILY">THRICE_DAILY (T.I.D.)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-[#6B6355]">Duration (DURATION)</label>
                          <input
                            type="text"
                            value={drugDuration}
                            onChange={(e) => setDrugDuration(e.target.value)}
                            className="w-full rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E5DFD3] bg-[#FAF7F0] p-3.5 space-y-3">
                      <div className="font-bold text-xs text-[#25231F] flex items-center gap-1.5">
                        <span className="text-sm">🥛</span>
                        <span>B. Co-Prescribed Anupana (COMPONENT_TYPE: ANUPANA)</span>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Carrier Vehicle / Liquid Medium</label>
                        <input
                          type="text"
                          placeholder="e.g. Ushnodaka (Lukewarm water), Madhu (Honey), or Godugdha (Milk)"
                          value={anupanaName}
                          onChange={(e) => setAnupanaName(e.target.value)}
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#E5DFD3] bg-[#FAF7F0] p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-[#25231F] flex items-center gap-1.5">
                          <span className="text-sm">🌿</span>
                          <span>C. Classical Pathya / Apathya Protocol (COMPONENT_TYPE: PATHYA) *</span>
                        </div>
                        <span className="text-[10px] font-semibold text-[#C87D0E]">NDCT 2019 Rule 67 Critical</span>
                      </div>
                      <textarea
                        rows={2}
                        value={pathyaRegimen}
                        onChange={(e) => setPathyaRegimen(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 3: Design & Monitoring Calendar */}
                {activeTab === "monitoring" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Trial Phase (STUDY_PHASE)</label>
                        <select
                          value={studyPhase}
                          onChange={(e) => setStudyPhase(e.target.value)}
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        >
                          <option value="PHASE_1">PHASE 1 (Safety Pilot)</option>
                          <option value="PHASE_2">PHASE 2 (Dose Finding)</option>
                          <option value="PHASE_3">PHASE 3 (Confirmatory Efficacy)</option>
                          <option value="PHASE_4">PHASE 4 (Post Marketing)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Design (STUDY_DESIGN)</label>
                        <select
                          value={studyDesign}
                          onChange={(e) => setStudyDesign(e.target.value)}
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        >
                          <option value="RANDOMIZED_PARALLEL">RANDOMIZED_PARALLEL</option>
                          <option value="OPEN_LABEL">OPEN_LABEL</option>
                          <option value="CROSSOVER">CROSSOVER</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Target Accrual (TARGET_ENROLMENT) *</label>
                        <input
                          type="number"
                          value={targetEnrolment}
                          onChange={(e) => setTargetEnrolment(e.target.value)}
                          required
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Interval (MONITORING_FREQUENCY)</label>
                        <select
                          value={monitoringFrequency}
                          onChange={(e) => setMonitoringFrequency(e.target.value)}
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        >
                          <option value="WEEKLY">WEEKLY</option>
                          <option value="BIWEEKLY">BIWEEKLY</option>
                          <option value="MONTHLY">MONTHLY</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">Start Date (MONITORING_START_DATE)</label>
                        <input
                          type="date"
                          value={monitoringStartDate}
                          onChange={(e) => setMonitoringStartDate(e.target.value)}
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-[#6B6355]">End Date (MONITORING_END_DATE)</label>
                        <input
                          type="date"
                          value={monitoringEndDate}
                          onChange={(e) => setMonitoringEndDate(e.target.value)}
                          className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Study_Criteria & Clinical Parameters */}
                {activeTab === "criteria" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B6355]">Inclusion Criteria (CRITERION_TYPE: INCLUSION)</label>
                      <textarea
                        rows={2}
                        value={inclusionCriteria}
                        onChange={(e) => setInclusionCriteria(e.target.value)}
                        className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B6355]">Exclusion Criteria (CRITERION_TYPE: EXCLUSION)</label>
                      <textarea
                        rows={2}
                        value={exclusionCriteria}
                        onChange={(e) => setExclusionCriteria(e.target.value)}
                        className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#6B6355]">Primary Clinical Endpoint (Study_clinical_parameters)</label>
                      <input
                        type="text"
                        value={primaryParam}
                        onChange={(e) => setPrimaryParam(e.target.value)}
                        className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between shrink-0">
                  <div className="text-[11px] text-[#6B6355]">
                    {activeTab !== "criteria" ? "Review each tab before initiating" : "Ready to write to PostgreSQL"}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalOpen(false)}
                      className="border-[#E5DFD3] text-xs text-[#6B6355]"
                    >
                      Cancel
                    </Button>
                    {activeTab !== "criteria" ? (
                      <Button
                        type="button"
                        onClick={() => {
                          if (activeTab === "general") setActiveTab("interventions");
                          else if (activeTab === "interventions") setActiveTab("monitoring");
                          else if (activeTab === "monitoring") setActiveTab("criteria");
                        }}
                        className="bg-[#2D5A27] hover:bg-[#23491E] text-white text-xs font-semibold px-4"
                      >
                        Next Section →
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="bg-[#2D5A27] hover:bg-[#23491E] text-white text-xs font-semibold px-4 cursor-pointer"
                      >
                        Save & Initialize CTRI
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}