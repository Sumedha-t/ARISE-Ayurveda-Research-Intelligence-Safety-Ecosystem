"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react"

const CHECKLIST_DATA: Record<string, { title: string; checks: string[]; jsonSnippet: string }> = {
  ResearchStudy: {
    title: "Standardization Checklist: ResearchStudy (AIIA-HTN-001)",
    checks: [
      "CTRI Registry identifier linked",
      "GCP-ASU interventional protocol design mapped",
      "Ethics Committee approval extension valid"
    ],
    jsonSnippet: '{\n  "resourceType": "ResearchStudy",\n  "id": "AIIA-HTN-001",\n  "status": "active",\n  "title": "Ayurveda Comparative Study in Essential Hypertension",\n  "identifier": [{ "system": "http://ctri.nic.in", "value": "CTRI/2026/08/001122" }]\n}'
  },
  ResearchSubject: {
    title: "Standardization Checklist: ResearchSubject (AIIA-HTN-002)",
    checks: [
      "Prakriti & Agni classification encoded (FHIR Extension)",
      "DPDP Act compliant digital e-Consent recorded",
      "USUBJID cross-reference validated against SDTM DM"
    ],
    jsonSnippet: '{\n  "resourceType": "ResearchSubject",\n  "id": "AIIA-HTN-002",\n  "status": "active",\n  "study": { "reference": "ResearchStudy/AIIA-HTN-001" },\n  "extension": [{ "url": "http://aiia.gov.in/prakriti", "value": "PITTA_KAPHA" }]\n}'
  },
  AdverseEvent: {
    title: "Standardization Checklist: AdverseEvent (AE-002)",
    checks: [
      "NDCT 2019 Rule 67 24h statutory timeline active",
      "Ayurvedic causality attributed (Pathya Ullanghana)",
      "MedDRA & NAMASTE dual ontology mapped"
    ],
    jsonSnippet: '{\n  "resourceType": "AdverseEvent",\n  "id": "AE-002",\n  "seriousness": "serious",\n  "causality": [{ "assessment": "PATHYA_ULLANGHANA" }]\n}'
  },
  ProtocolDeviation: {
    title: "Standardization Checklist: ProtocolDeviation (DEV-001)",
    checks: [
      "Visit window assessment variance flagged",
      "Investigator corrective action logged",
      "ALCOA+ audit ledger synchronization complete"
    ],
    jsonSnippet: '{\n  "resourceType": "DetectedIssue",\n  "id": "DEV-001",\n  "status": "final",\n  "code": "TIMING_DEVIATION"\n}'
  }
}

export default function InteroperabilityPage() {
  const [selectedResource, setSelectedResource] = useState<string>("ResearchStudy")
  const [showJson, setShowJson] = useState(false)

  const activeChecklist = CHECKLIST_DATA[selectedResource]

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5DFD3] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#25231F]">
            Regulatory Interoperability & Data Exchange
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Automated HL7 FHIR Release 4 standardization and CDISC SDTM v3.3 dataset streaming for national registry compliance
          </p>
        </div>
      </div>

      {/* CDISC SDTM Exports */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs space-y-3">
        <div>
          <h2 className="text-sm font-bold text-[#25231F]">CDISC SDTM Regulatory Exports</h2>
          <p className="text-xs text-[#6B6355]">
            Pre-compiled, standard clinical trial domains ready for statistical audit and regulatory submission
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="rounded-lg border border-[#E5DFD3] bg-[#FAF7F0] p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#25231F]">Demographics Domain (DM.csv)</span>
              <p className="text-[11px] text-[#6B6355] font-mono">STUDYID, USUBJID, RFSTDTC, Age, Sex</p>
            </div>
            <a href="/api/sdtm/dm/bd80cffa-ec26-5592-a626-63acdd761bf0" download>
              <Button size="sm" className="bg-[#2D5A27] hover:bg-[#23491E] text-white text-xs font-semibold h-8 px-3 shadow-xs cursor-pointer">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download DM.csv
              </Button>
            </a>
          </div>

          <div className="rounded-lg border border-[#E5DFD3] bg-[#FAF7F0] p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#25231F]">Adverse Events Domain (AE.csv)</span>
              <p className="text-[11px] text-[#6B6355] font-mono">AETERM, AESEV, AESER, AEOUT, MedDRA</p>
            </div>
            <a href="/api/sdtm/ae" download>
              <Button size="sm" className="bg-[#C87D0E] hover:bg-[#A6670B] text-white text-xs font-semibold h-8 px-3 shadow-xs cursor-pointer">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download AE.csv
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* HL7 FHIR R4 Clinical Resource Verification */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#25231F]">HL7 FHIR R4 Clinical Resource Verification</h2>
          <p className="text-xs text-[#6B6355]">
            Select an entity to review its clinical standardization and regulatory checklist
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { key: "ResearchStudy", id: "AIIA-HTN-001", label: "Essential Hypertension Comparative Trial" },
            { key: "ResearchSubject", id: "AIIA-HTN-002", label: "Subject Phenotype & Consent eCRF" },
            { key: "AdverseEvent", id: "AE-002", label: "Acute Hypotension (Rule 67 24h Triage)" },
            { key: "ProtocolDeviation", id: "DEV-001", label: "Assessment Window Non-Conformance" },
          ].map((item) => {
            const isSelected = selectedResource === item.key
            return (
              <div
                key={item.key}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isSelected ? "border-[#2D5A27] bg-[#FAF7F0] shadow-xs" : "border-[#E5DFD3] bg-[#FAF7F0]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#25231F]">{item.key}</span>
                    <Badge className="text-[10px] bg-[#2D5A27]/10 text-[#2D5A27] border-[#2D5A27]/25 font-semibold">
                      R4 Compliant
                    </Badge>
                  </div>
                  <div className="text-xs font-bold text-[#2D5A27] font-mono mt-1.5">{item.id}</div>
                  <div className="text-[11px] text-[#6B6355] mt-0.5 leading-snug">{item.label}</div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setSelectedResource(item.key)}
                  className={`mt-4 w-full text-xs font-semibold h-7 cursor-pointer ${
                    isSelected
                      ? "bg-[#2D5A27] text-white hover:bg-[#23491E]"
                      : "bg-[#2D5A27]/90 text-white hover:bg-[#2D5A27]"
                  }`}
                >
                  Verify Resource
                </Button>
              </div>
            )
          })}
        </div>

        {/* Dynamic Standardization Checklist */}
        <div className="rounded-xl border border-[#E5DFD3] bg-[#FAF7F0] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#25231F]">
              <CheckCircle2 className="h-4 w-4 text-[#2D5A27]" />
              <span>{activeChecklist.title}</span>
            </div>
            <button
              onClick={() => setShowJson(!showJson)}
              className="text-xs font-semibold text-[#6B6355] hover:text-[#25231F] flex items-center gap-1 cursor-pointer"
            >
              <span>{showJson ? "Hide Technical FHIR JSON" : "View Technical FHIR JSON"}</span>
              {showJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {activeChecklist.checks.map((check, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#E5DFD3] bg-[#FCFAF7] px-3.5 py-2.5 text-xs text-[#25231F] flex items-center gap-2 font-medium shadow-xs"
              >
                <span className="text-[#2D5A27] font-bold">✓</span>
                <span>{check}</span>
              </div>
            ))}
          </div>

          {showJson && (
            <div className="mt-3 rounded-lg border border-[#25231F]/15 bg-[#1F1E1B] p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto">
              <pre>{activeChecklist.jsonSnippet}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}