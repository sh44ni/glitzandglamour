# Implementation Plan — Admin Location Type Selector + Section 03 Dynamic Content

## Overview
Replace the "Include travel fees" checkbox in the admin form with a proper **Location Type** radio/toggle:
- **In-Studio** (default) — at Glitz & Glamour Studio, 812 Frances Dr, Vista CA
- **On Location** — event at client venue, travel fees apply

## Files to Change

### 1. `SpecialEventAdminForm.tsx`
- Replace the travel checkbox with a styled **2-option location selector** (In-Studio / On Location)
- When **In-Studio**: `travelEnabled = false`, show studio address field (parking notes), hide travel fee fields
- When **On Location**: `travelEnabled = true`, show location address + travel fee + distance fields

### 2. `special-events-v1-contract-only.html`
Add two conditional blocks for Section 03:
- When `travelEnabled=false`: In-Studio content (studio address, parking, arrival policy) + in-studio initial
- When `travelEnabled=true`: Current travel content (travel fee, distance, parking) + travel initial

### 3. `renderFrozenContract.ts`
Make the PDF also conditionally render the correct Section 03 variant.

## In-Studio Initial Text (from screenshot)
"I have read, understand, and acknowledge that all services will be performed at Glitz & Glamour Studio, 812 Frances Dr, Vista, CA 92084. I am solely responsible for my own transportation, parking, and arriving on time. I am solely responsible for supervising any children, pets, or non-participating guests I bring, and I understand the Artist may require their removal, without refund, credit, or liability to the Artist, if they materially disrupt services, create an unsafe environment, or otherwise interfere with the Artist's ability to safely and professionally perform services. I understand that lawful service animals are not treated as pets and are governed by the service-animal language in Section 03. I also acknowledge that any damage caused by me, my party, or my guests is my sole financial responsibility (Section 03)."

## Section 03 In-Studio Content
Title: "In-Studio Arrival, Parking & Studio Policies"
Info grid: Service Location (812 Frances Dr, Vista, CA 92084), Parking/Access Notes (admin field)
Body text: Studio address confirmation, arrival responsibility, guest/child supervision, service animals, damage liability

## AdminContractPayload changes
- No schema change needed — `travelEnabled: false` already handles in-studio case
- Add optional `parkingNotes` field to dynamic fields for in-studio parking info
