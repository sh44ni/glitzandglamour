/**
 * Injects server-controlled admin data and secure-submit wiring into the legal HTML template.
 * Legal clause text in the file is untouched; we only prepend/append scripts and patch the contract # generator.
 */
import type { AdminContractPayload } from './adminContractPayload';
import { readSpecialEventsTemplateHtml } from './renderFrozenContract';
import { SPECIAL_EVENT_INIT_IDS } from './specialEventConstants';

function jsonForScriptTag(obj: unknown): string {
    return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function buildPopulateAdminScript(): string {
    return `
(function(){
  var A = window.__GGS_ADMIN__;
  if (!A) return;
  document.documentElement.classList.add('ggs-client-embed');
  function setv(id, v){
    var el = document.getElementById(id);
    if (el && 'value' in el) el.value = v != null ? String(v) : '';
  }
  setv('f_date', A.contractDate);
  setv('f_num', A.contractNumber);
  setv('f_client', A.clientLegalName);
  setv('f_phone', A.phone);
  setv('f_email', A.email);
  setv('f_event_type', A.eventType);
  setv('f_event_date', A.eventDate);
  setv('f_start_time', A.startTime);
  setv('f_venue', A.venue);
  setv('f_headcount', A.headcount);
  setv('f_travel', A.travelRequired);
  setv('f_travel_fee', A.travelFee);
  setv('f_travel_dest', A.travelDest);
  setv('f_miles', A.miles);
  setv('f_retainer', A.retainer);
  setv('f_balance', A.balance);
  setv('f_pp_active', A.ppActive);
  setv('f_pp2_amt', A.pp2Amt);
  setv('f_pp2_date', A.pp2Date);
  setv('f_pp3_amt', A.pp3Amt);
  setv('f_pp3_date', A.pp3Date);
  setv('f_pp_final', A.ppFinal);
  setv('f_min_svc', A.minSvc);
  setv('f_lock_days', A.lockDays);
  setv('f_addon_fee', A.addonFee);
  setv('f_prep_fee', A.prepFee);
  setv('f_overtime_rate', A.overtimeRate);
  setv('f_trial_fee', A.trialFee);
  setv('f_minors', A.minors);
  setv('f_guardian', A.guardian);
  setv('f_guardian_phone', A.guardianPhone);
  var tb = document.getElementById('svcBody');
  if (tb && Array.isArray(A.services)) {
    tb.innerHTML = '';
    A.services.forEach(function(s){
      if (!s || !String(s.description || '').trim()) return;
      var tr = document.createElement('tr');
      tr.className = 'svc-row';
      tr.innerHTML = '<td><input type="text" placeholder="Service description" oninput="sync()"></td>'+
        '<td><input type="number" placeholder="0.00" min="0" step="0.01" oninput="sync()"></td>'+
        '<td><input type="text" placeholder="Notes…" oninput="sync()"></td>'+
        '<td><button class="btn-del" onclick="delSvc(this)" title="Remove">✕</button></td>';
      var ins = tr.querySelectorAll('input');
      ins[0].value = s.description || '';
      ins[1].value = s.price || '';
      ins[2].value = s.notes || '';
      tb.appendChild(tr);
    });
    if (!tb.querySelector('.svc-row')) {
      var tr0 = document.createElement('tr');
      tr0.className = 'svc-row';
      tr0.innerHTML = '<td><input type="text" placeholder="e.g. Bridal Hair Updo" oninput="sync()"></td>'+
        '<td><input type="number" placeholder="0.00" min="0" step="0.01" oninput="sync()"></td>'+
        '<td><input type="text" placeholder="Notes…" oninput="sync()"></td>'+
        '<td><button class="btn-del" onclick="delSvc(this)" title="Remove">✕</button></td>';
      tb.appendChild(tr0);
    }
  }
})();
`.trim();
}

function embedClientStyles(): string {
    return `
<style id="ggs-embed-styles">
html.ggs-client-embed .builder{display:none!important}
html.ggs-client-embed .topbar .btn-top.btn-ghost-sm[onclick*="clearAll"]{display:none!important}
</style>
`.trim();
}

/** Patches attemptFinish to POST to the app API when a signing token is present. */
function embedSubmitTail(): string {
    const initList = JSON.stringify(SPECIAL_EVENT_INIT_IDS);
    return `
<script>
(function(){
  var TOKEN = window.__GGS_CLIENT_SIGN_TOKEN__;
  if (!TOKEN) return;
  var INIT_IDS = ${initList};
  function val(id){ var e=document.getElementById(id); return e&&'value' in e ? String(e.value).trim() : ''; }
  function canvasToB64(){
    var c=document.getElementById('sigCanvas');
    if(!c||!c.toDataURL) return '';
    var u=c.toDataURL('image/png');
    return u.indexOf(',')>=0 ? u.split(',')[1] : u;
  }
  function collect(){
    var initials = {};
    for (var i=0;i<INIT_IDS.length;i++){
      var id = INIT_IDS[i];
      var row = document.getElementById(id);
      var box = document.getElementById('ibox_'+id.replace('init_',''));
      if (!row || !row.classList.contains('done') || !box){
        initials[id] = '';
      } else {
        initials[id] = (box.textContent || '').replace(/^Initial$/i,'').trim();
      }
    }
    var allergySelect = val('c_allergy_select_inline');
    var allergyDetail = val('c_allergy_detail_inline');
    var skinSelect = val('c_skin_select_inline');
    var skinDetail = val('c_skin_detail_inline');
    var photoEl = document.getElementById('f_photo');
    var photoValue = photoEl ? photoEl.value : '';
    var photoRestrict = val('f_photo_restrict');
    var geo = document.getElementById('geoConsentRow');
    var printed = '';
    var pnr = document.getElementById('printedNameDisplay');
    if (pnr && pnr.textContent) printed = pnr.textContent.trim();
    if (!printed) printed = val('sig_client_name');
    var sigDateEl = document.getElementById('sig_client_date');
    var sigDate = sigDateEl ? sigDateEl.textContent.trim() : '';
    return {
      mode: 'special-events-v1',
      geoConsent: !!(geo && geo.classList.contains('done')),
      allergySelect: allergySelect,
      allergyDetail: allergyDetail,
      skinSelect: skinSelect,
      skinDetail: skinDetail,
      photoValue: photoValue,
      photoRestrict: photoRestrict,
      initials: initials,
      printedName: printed,
      clientSignDateDisplay: sigDate && sigDate.indexOf('___')<0 ? sigDate : '',
      signatureMethod: 'draw',
      signaturePngBase64: canvasToB64()
    };
  }
  var _orig = attemptFinish;
  attemptFinish = async function(){
    if (!window.__GGS_CLIENT_SIGN_TOKEN__) { return _orig.apply(this, arguments); }
    var btn = document.getElementById('btnSubmit');
    if(btn){ btn.disabled = true; btn.textContent = 'Submitting…'; }
    try {
      var body = collect();
      var missing = [];
      if (!body.geoConsent) missing.push('data consent');
      INIT_IDS.forEach(function(id){
        if (!body.initials[id] || body.initials[id].length<1) missing.push(id);
      });
      if (!body.allergySelect) missing.push('allergies');
      if (!body.skinSelect) missing.push('skin');
      if (!body.photoValue) missing.push('photo consent');
      if (body.photoValue === 'No — consent denied' && !String(body.photoRestrict||'').trim()) missing.push('photo restrictions');
      if (!body.printedName) missing.push('printed name');
      if (!body.clientSignDateDisplay) missing.push('signing date');
      if (!body.signaturePngBase64 || body.signaturePngBase64.length<80) missing.push('signature');
      if (missing.length){
        toast('Please complete: '+missing.join(', '));
        if(btn){ btn.disabled = false; btn.textContent = 'Finish & Submit'; }
        return;
      }
      var res = await fetch('/api/contracts/sign/'+encodeURIComponent(TOKEN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      var data = await res.json().catch(function(){ return {}; });
      if (!res.ok){
        toast(data.error || 'Submit failed');
        if(btn){ btn.disabled = false; btn.textContent = 'Finish & Submit'; }
        return;
      }
      var statusEl = document.getElementById('contract_status');
      if(statusEl){
        statusEl.textContent = 'Client executed — pending studio acceptance';
        statusEl.style.color = '#185fa5';
        statusEl.style.fontWeight = '700';
      }
      var modalP = document.querySelector('#modal .modal p');
      var modalBtns = document.querySelector('#modal .modal-btns');
      if(modalP) modalP.innerHTML = 'Thank you. Your agreement has been submitted to Glitz &amp; Glamour Studio. You will receive a confirmation email shortly.';
      if(modalBtns) modalBtns.innerHTML = '<button class="btn-modal-p" onclick="document.getElementById(\\'modal\\').classList.remove(\\'show\\')">Close</button>';
      document.getElementById('modal').classList.add('show');
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'ggs-contract-submitted', referenceCode: data.referenceCode }, '*');
      }
    } catch(e){
      toast('Network error — please try again');
    }
    if(btn){ btn.disabled = false; btn.textContent = 'Finish & Submit'; }
  };
})();
</script>
`.trim();
}

export function buildEmbeddedSpecialEventHtml(admin: AdminContractPayload, token: string): string {
    let html = readSpecialEventsTemplateHtml().replace(/\r\n/g, '\n');
    const headInject = `
${embedClientStyles()}
<script>window.__GGS_ADMIN__=${jsonForScriptTag(admin)};window.__GGS_CLIENT_SIGN_TOKEN__=${jsonForScriptTag(token)};</script>
`;
    html = html.replace(/<head>/i, `<head>${headInject}`);

    html = html.replace(
        '// ── AUTO-GENERATE CONTRACT NUMBER (GGS-XXXXXXXXXX) ──\n(function generateContractNumber(){',
        `${buildPopulateAdminScript()}\n// ── AUTO-GENERATE CONTRACT NUMBER (GGS-XXXXXXXXXX) ──\n(function generateContractNumber(){
  if(window.__GGS_ADMIN__ && window.__GGS_ADMIN__.contractNumber){
    var el = document.getElementById('f_num');
    if(el) el.value = window.__GGS_ADMIN__.contractNumber;
    return;
  }
`
    );

    html = html.replace(/\r?\n<\/script>\r?\n<\/body>\r?\n<\/html>/, `\n</script>\n${embedSubmitTail()}\n</body>\n</html>`);

    return html;
}
