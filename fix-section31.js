/**
 * Fix the contract-only template:
 * 1. Replace old Section 30 content with v1.2 Section 31 content
 * 2. Remove old interactive signature blocks (they render as ugly static text in step 8)
 */
const fs = require('fs');

const filePath = 'src/contracts/templates/special-events-v1-contract-only.html';
let html = fs.readFileSync(filePath, 'utf8');

// === STEP 1: Replace old Section 30 header + content with v1.2 Section 31 ===

const oldSectionHeader = `    <!-- ── SECTION 30: SIGNATURES ── -->
      <div class="c-sec-num">Section 30</div>
      <div class="c-sec-title">Agreement, Electronic Consent &amp; Signatures</div>`;

const newSectionHeader = `    <!-- ── SECTION 31: SIGNATURES ── -->
      <div class="c-sec-num">Section 31</div>
      <div class="c-sec-title">Agreement, Electronic Consent &amp; Signatures</div>`;

if (html.includes(oldSectionHeader)) {
  html = html.replace(oldSectionHeader, newSectionHeader);
  console.log('✅ Updated section header from Section 30 to Section 31');
} else {
  console.log('⚠️  Could not find old section header - may already be updated');
}

// === STEP 2: Replace old body-text content with v1.2 content ===

// Find the old body text paragraphs and replace with v1.2 content
const oldBodyStart = '        <p>By signing below, both parties confirm they have read, reviewed, and fully understood every section of this Agreement in its entirety. Where the Client is a minor, this Agreement must be executed by the Client\'s parent or legal guardian, whose signature legally binds both the guardian and the minor.';
const oldBodyEnd = '        <p style="font-size:.78rem;color:var(--muted);font-style:italic">The Client, or signing parent/legal guardian acting on behalf of a minor Client, represents that they are at least 18 years of age and legally competent to enter into this Agreement. If signing on behalf of a minor, the signer represents that they are the minor\'s parent or legal guardian, have full legal authority to bind the minor and themselves to these terms, and that the minor\'s signature alone is not sufficient to execute this Agreement under California law.</p>';

const newBodyContent = `        <p>By signing below, both parties confirm they have read, reviewed, and fully understood every section of this Agreement in its entirety. Where the Client is a minor, this Agreement must be executed by the Client\u2019s parent, legal guardian, or an adult signer who represents and warrants that they have current authority and/or authorization from the minor\u2019s parent or legal guardian to sign this Agreement, consent to services, and make service-related decisions on the minor\u2019s behalf. The adult Client, the signing parent/legal guardian, or the authorized adult signer of a minor Client specifically acknowledges the Payment, Retainer &amp; Balance terms \u2014 including the Chargebacks &amp; Material Breach clause (Section 04), the Payment Plan Option (Section 05), the Minimum Booking &amp; Final Headcount obligations (Section 06), the Cancellation Policy (Section 09), the Rescheduling Policy (Section 10), the Client Preparation Requirements (Section 11), the Late Arrival Policy (Section 12), the Overtime &amp; Delay Fees (Section 13), the Liability &amp; Allergy Disclosure (Section 14), the Photo &amp; Social Media Release (Section 15), the Force Majeure &amp; Client Emergencies (Section 21), and the Limitation of Liability (Section 25). Both parties agree to be fully and legally bound by all terms and conditions stated herein.</p>
        <p><strong>Electronic Signature Consent:</strong> The parties agree that electronic signatures applied to this Agreement are valid, enforceable, and legally binding to the same extent as original handwritten signatures, pursuant to the California Uniform Electronic Transactions Act (UETA), California Civil Code \u00A71633.1 et seq., and the federal Electronic Signatures in Global and National Commerce Act (E-SIGN Act), 15 U.S.C. \u00A77001 et seq. By proceeding to sign electronically, each party affirmatively consents to the use of electronic records and signatures for this transaction.</p>
        <p>This Agreement becomes legally binding and the booking is confirmed only after: (1) the Client has signed this Agreement; (2) the Artist has signed or issued written acceptance via text or email; and (3) the retainer has been received by Glitz &amp; Glamour Studio. Submission of this signed Agreement alone does not confirm the booking. The Client will receive written confirmation from the Artist once all three conditions are satisfied.</p>
        <p><strong>Signer Authorization &amp; Representation.</strong> The individual signing this Agreement represents and warrants that they are either: (a) the adult Client entering into this Agreement on their own behalf; (b) if the Client is a minor, the Client\u2019s parent or legal guardian; or (c) if the Client is a minor and the signer is not the parent/legal guardian, an adult authorized by the minor\u2019s parent or legal guardian to sign this Agreement, consent to services, and make service-related decisions on the minor\u2019s behalf. The signer accepts full responsibility for the accuracy, validity, and continuing effectiveness of that authority. A minor Client may not independently execute this Agreement, and a minor\u2019s signature alone does not constitute valid execution. If the authorized signer directs another person, including a minor child, to assist with completing electronic initials, clicking acknowledgment boxes, or applying a typed or drawn signature on the signer\u2019s behalf, the authorized signer expressly adopts those actions as their own and confirms they were performed at the signer\u2019s direction and with full authorization. Such assistance does not affect the validity or enforceability of this Agreement.</p>`;

if (html.includes(oldBodyStart)) {
  // Find the start and end positions
  const startIdx = html.indexOf(oldBodyStart);
  const endIdx = html.indexOf(oldBodyEnd);
  if (startIdx !== -1 && endIdx !== -1) {
    const endOfOldBody = endIdx + oldBodyEnd.length;
    html = html.substring(0, startIdx) + newBodyContent + html.substring(endOfOldBody);
    console.log('✅ Updated Section 31 body text to v1.2 content');
  }
} else {
  console.log('⚠️  Could not find old body text - checking if already updated');
}

// === STEP 3: Remove everything between GGS_WIZARD_END_TERMS and the structural closing tags ===

// The pattern: from "<!-- GGS_WIZARD_END_TERMS -->" to just before "</div><!-- /section 29 -->"
// We need to keep: </div><!-- /section 29 --> and everything after (c-body close, footer, contract close)

const wizardEndMarker = '      <!-- GGS_WIZARD_END_TERMS -->';
const sectionCloseMarker = '    </div><!-- /section 29 -->';

const wizardEndIdx = html.indexOf(wizardEndMarker);
const sectionCloseIdx = html.indexOf(sectionCloseMarker);

if (wizardEndIdx !== -1 && sectionCloseIdx !== -1) {
  // Remove everything from wizard end marker to section close (exclusive)
  html = html.substring(0, wizardEndIdx) + '\n' + html.substring(sectionCloseIdx);
  console.log('✅ Removed old interactive signature blocks');
} else {
  console.log('⚠️  Could not find wizard end marker or section close marker');
  console.log('   wizardEndIdx:', wizardEndIdx);
  console.log('   sectionCloseIdx:', sectionCloseIdx);
  
  // Try alternate approach - find the CLIENT SIGNATURE BLOCK and remove from there
  const sigBlockStart = '      <!-- CLIENT SIGNATURE BLOCK -->';
  const sigBlockIdx = html.indexOf(sigBlockStart);
  if (sigBlockIdx !== -1) {
    // Find the closing structure after the sig blocks
    // Look for </div><!-- /c-body --> or the footer
    const footerMarker = '  <div class="c-footer">';
    const footerIdx = html.indexOf(footerMarker);
    if (footerIdx !== -1) {
      // Also remove the GGS_WIZARD_END_TERMS comment if present
      let removeFrom = sigBlockIdx;
      const wizEnd2 = html.lastIndexOf('<!-- GGS_WIZARD_END_TERMS -->', sigBlockIdx);
      if (wizEnd2 !== -1 && wizEnd2 > sigBlockIdx - 200) {
        removeFrom = wizEnd2;
      }
      
      // We need to close the c-sec div that was opened for Section 31
      // and the c-body div
      const closingHtml = `
    </div>

  </div><!-- /c-body -->

`;
      html = html.substring(0, removeFrom) + closingHtml + html.substring(footerIdx);
      console.log('✅ Removed old interactive signature blocks (alternate method)');
    }
  }
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('\n✅ File saved successfully!');

// Verify the result
const result = fs.readFileSync(filePath, 'utf8');
const lines = result.split('\n');
console.log(`\nTotal lines: ${lines.length}`);

// Check Section 31 is present
if (result.includes('Section 31')) {
  console.log('✅ Section 31 header found');
}
if (result.includes('Signer Authorization')) {
  console.log('✅ Signer Authorization paragraph found');
}
if (result.includes('<!-- CLIENT SIGNATURE BLOCK -->')) {
  console.log('❌ Old signature block still present!');
} else {
  console.log('✅ Old signature block removed');
}
if (result.includes('sig-block')) {
  console.log('❌ sig-block elements still present!');
} else {
  console.log('✅ No sig-block elements');
}
if (result.includes('c-footer')) {
  console.log('✅ Footer preserved');
}
