interface Env {
  RESEND_API_KEY?: string;
  FIT_CHECK_TO_EMAIL?: string;
  FIT_CHECK_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface FitCheckSubmission {
  challenge: string;
  impact: string;
  environment: string;
  crm: string;
  leadership: string;
  changeReadiness: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  additionalContext: string;
  sendCopy: boolean;
}

interface ValidationResult {
  submission?: FitCheckSubmission;
  errors: string[];
}

interface PagesContext {
  request: Request;
  env: Env;
}

const MAX_BODY_BYTES = 32_768;
const TURNSTILE_ACTION = "fit-check";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerificationResult {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

async function verifyTurnstile(
  request: Request,
  secretKey: string,
  token: string,
): Promise<TurnstileVerificationResult> {
  const body = new FormData();
  body.set("secret", secretKey);
  body.set("response", token);
  body.set("idempotency_key", crypto.randomUUID());

  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) body.set("remoteip", remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Turnstile verification returned ${response.status}.`);
  }

  return (await response.json()) as TurnstileVerificationResult;
}

const environmentOptions: Record<string, string> = {
  fragmented: "Teams use disconnected systems and inconsistent workflows",
  transitioning: "Systems or workflows are being combined or replaced",
  "modern-siloed": "The tools are modern, but teams or workflows remain siloed",
  established: "Core systems and workflows are in place but need improvement",
  uncertain: "We need help making sense of the current state",
};

const crmOptions: Record<string, string> = {
  measured: "It supports workflows and performance decisions",
  "active-limited": "We collect data, but teams do not use it consistently",
  fragmented: "Data quality or ownership varies across teams",
  early: "We are still building how we use the CRM",
  "no-crm": "We do not use a CRM or central customer record",
  unknown: "We do not know whether the data is reliable enough",
};

const leadershipOptions: Record<string, string> = {
  yes: "Yes, an accountable sponsor is involved",
  developing: "Support exists, but ownership is still taking shape",
  no: "No, we are still building internal support",
};

const readinessOptions: Record<string, string> = {
  yes: "Yes, workflow changes are within scope",
  limited: "Possibly, depending on the recommendation",
  no: "No, the current process must stay mostly unchanged",
};

function readText(
  formData: FormData,
  key: string,
  label: string,
  errors: string[],
  {
    required = true,
    min = 0,
    max = 2_000,
  }: { required?: boolean; min?: number; max?: number } = {},
): string {
  const rawValue = formData.get(key);
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  if (required && !value) {
    errors.push(`${label} is required.`);
  } else if (value && value.length < min) {
    errors.push(`${label} must be at least ${min} characters.`);
  } else if (value.length > max) {
    errors.push(
      `${label} must be ${max.toLocaleString()} characters or fewer.`,
    );
  }

  return value;
}

function readChoice(
  formData: FormData,
  key: string,
  label: string,
  options: Record<string, string>,
  errors: string[],
): string {
  const rawValue = formData.get(key);
  const value = typeof rawValue === "string" ? rawValue : "";

  if (!Object.hasOwn(options, value)) {
    errors.push(`${label} is required.`);
    return "";
  }

  return options[value];
}

function validateSubmission(formData: FormData): ValidationResult {
  const errors: string[] = [];
  const challenge = readText(
    formData,
    "challenge",
    "Primary challenge",
    errors,
    { min: 40 },
  );
  const impact = readText(formData, "impact", "Business impact", errors, {
    min: 20,
  });
  const environment = readChoice(
    formData,
    "environment",
    "Operating environment",
    environmentOptions,
    errors,
  );
  const crm = readChoice(
    formData,
    "crm",
    "Customer data usefulness",
    crmOptions,
    errors,
  );
  const leadership = readChoice(
    formData,
    "leadership",
    "Leadership alignment",
    leadershipOptions,
    errors,
  );
  const changeReadiness = readChoice(
    formData,
    "change-readiness",
    "Timing",
    readinessOptions,
    errors,
  );
  const name = readText(formData, "name", "Name", errors, { max: 100 });
  const email = readText(formData, "email", "Work email", errors, {
    max: 254,
  });
  const organization = readText(
    formData,
    "organization",
    "Organization",
    errors,
    { max: 120 },
  );
  const role = readText(formData, "role", "Role", errors, {
    required: false,
    max: 120,
  });
  const additionalContext = readText(
    formData,
    "additional-context",
    "Additional context",
    errors,
    { required: false, max: 1_000 },
  );
  const sendCopy = formData.get("send-copy") === "yes";

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Work email must be a valid email address.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors,
    submission: {
      challenge,
      impact,
      environment,
      crm,
      leadership,
      changeReadiness,
      name,
      email,
      organization,
      role,
      additionalContext,
      sendCopy,
    },
  };
}

function formatSubmission(submission: FitCheckSubmission): string {
  return [
    "New Cadence Lab Fit Check submission",
    "",
    `Submitted: ${new Date().toISOString()}`,
    "",
    "CONTACT",
    `Name: ${submission.name}`,
    `Work email: ${submission.email}`,
    `Organization: ${submission.organization}`,
    `Role: ${submission.role || "Not provided"}`,
    `Copy sent to submitter: ${submission.sendCopy ? "Yes" : "No"}`,
    "",
    "CURRENT SITUATION",
    `Primary challenge: ${submission.challenge}`,
    "",
    `Useful result: ${submission.impact}`,
    "",
    "OPERATING ENVIRONMENT",
    `Environment: ${submission.environment}`,
    `Customer data usefulness: ${submission.crm}`,
    "",
    "READINESS",
    `Leadership alignment: ${submission.leadership}`,
    `Willingness to change: ${submission.changeReadiness}`,
    "",
    "ADDITIONAL CONTEXT",
    submission.additionalContext || "Not provided",
    "",
    "HUMAN REVIEW: FITCHECK DECISION BRIEF",
    "Reply with: observed problem; likely problem class; operating complexity; readiness state; primary constraint; evidence and open questions; one next decision; Cadence Lab path only if appropriate.",
    "Review problem clarity, operating complexity, evidence readiness, and change readiness. Distinguish reported facts from hypotheses. Do not infer readiness from tools alone.",
    "States: Clarify first / Align first / Evidence first / Stabilize first / Ready to diagnose / Explore implementation. Explain the state; do not assign a numerical score. Implementation requires supporting diagnosis and scope, not just positive intake answers.",
    "Use docs/fitcheck-decision-brief.md for the review method and reply template. Send a completed brief, not this internal checklist.",
  ].join("\n");
}

// The receipt goes to whatever address was typed into the form, so it must
// not repeat any free text the submitter wrote (name, challenge, impact,
// additional context). Otherwise anyone could use this form to send their own
// message from Cadence Lab's domain to a stranger. Only the multiple-choice
// answers, which are mapped to fixed labels server-side, are included.
function formatSubmitterCopy(submission: FitCheckSubmission): string {
  return [
    "Hello,",
    "",
    "Cadence Lab received your Fit Check. Here is a summary of your multiple-choice answers.",
    "",
    "OPERATING ENVIRONMENT",
    `Environment: ${submission.environment}`,
    `Customer data usefulness: ${submission.crm}`,
    "",
    "READINESS",
    `Leadership alignment: ${submission.leadership}`,
    `Willingness to change: ${submission.changeReadiness}`,
    "",
    "Your written answers were received in full and are not repeated here. Matt will review your submission and email your free FitCheck Decision Brief separately. This receipt is not your assessment or a consulting agreement.",
    "",
    "If you did not submit a Fit Check, you can ignore this email. No account was created.",
    "",
    "You requested this one-time email while submitting the Fit Check. It does not subscribe you to marketing.",
  ].join("\n");
}

async function readBodyWithinLimit(
  request: Request,
  limit: number,
): Promise<Uint8Array<ArrayBuffer> | null> {
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function textResponse(
  message: string,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export const onRequest = async ({
  request,
  env,
}: PagesContext): Promise<Response> => {
  if (request.method !== "POST") {
    return textResponse("Method not allowed.", 405, { Allow: "POST" });
  }

  const requestUrl = new URL(request.url);
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && requestOrigin !== requestUrl.origin) {
    return textResponse("Forbidden.", 403);
  }

  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return textResponse("Submission is too large.", 413);
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (
    !contentType.startsWith("application/x-www-form-urlencoded") &&
    !contentType.startsWith("multipart/form-data")
  ) {
    return textResponse("Unsupported submission format.", 415);
  }

  // Content-Length can be absent (chunked uploads), so enforce the limit on
  // the bytes actually read rather than trusting the header.
  const body = await readBodyWithinLimit(request, MAX_BODY_BYTES);
  if (body === null) {
    return textResponse("Submission is too large.", 413);
  }

  let formData: FormData;
  try {
    formData = await new Response(body, {
      headers: { "Content-Type": contentType },
    }).formData();
  } catch {
    return textResponse(
      "The submission could not be read. Please go back and try again.",
      400,
    );
  }

  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim()) {
    return Response.redirect(new URL("/thanks/", request.url), 303);
  }

  if (!env.TURNSTILE_SECRET_KEY) {
    console.error("Fit Check Turnstile verification is not configured.");
    return textResponse(
      "The Fit Check is temporarily unavailable. Your information was not sent. Please try again later.",
      503,
    );
  }

  const turnstileToken = formData.get("cf-turnstile-response");
  if (typeof turnstileToken !== "string" || !turnstileToken.trim()) {
    return textResponse(
      "Please complete the security check, then submit the Fit Check again.",
      400,
    );
  }

  let turnstileResult: TurnstileVerificationResult;
  try {
    turnstileResult = await verifyTurnstile(
      request,
      env.TURNSTILE_SECRET_KEY,
      turnstileToken,
    );
  } catch (error) {
    console.error("Fit Check Turnstile verification failed.", error);
    return textResponse(
      "The security check is temporarily unavailable. Your information was not sent. Please try again.",
      503,
    );
  }

  // The token must have been issued for the host that received this request.
  // Checking every host (not only the apex) stops a token minted on another
  // hostname from being replayed against a preview or www deployment.
  const hostnameIsValid = turnstileResult.hostname === requestUrl.hostname;

  if (
    !turnstileResult.success ||
    turnstileResult.action !== TURNSTILE_ACTION ||
    !hostnameIsValid
  ) {
    console.warn("Fit Check Turnstile verification was rejected.", {
      action: turnstileResult.action,
      hostname: turnstileResult.hostname,
      errorCodes: turnstileResult["error-codes"],
    });
    return textResponse(
      "The security check expired or could not be verified. Please go back and try again.",
      400,
    );
  }

  const { submission, errors } = validateSubmission(formData);
  if (!submission) {
    return textResponse(
      `The submission needs attention:\n\n${errors
        .map((error) => `- ${error}`)
        .join("\n")}\n\nUse your browser's back button to correct it.`,
      400,
    );
  }

  if (
    !env.RESEND_API_KEY ||
    !env.FIT_CHECK_TO_EMAIL ||
    !env.FIT_CHECK_FROM_EMAIL
  ) {
    console.error(
      "Fit Check email delivery is missing required environment variables.",
    );
    return textResponse(
      "The Fit Check is temporarily unavailable. Your information was not sent. Please try again later.",
      503,
    );
  }

  const subjectOrganization = submission.organization.replace(/[\r\n]+/g, " ");
  const subjectName = submission.name.replace(/[\r\n]+/g, " ");
  const internalEmail = {
    from: env.FIT_CHECK_FROM_EMAIL,
    to: [env.FIT_CHECK_TO_EMAIL],
    reply_to: submission.email,
    subject: `Fit Check: ${subjectOrganization} | ${subjectName}`,
    text: formatSubmission(submission),
  };
  const resendUrl = submission.sendCopy
    ? "https://api.resend.com/emails/batch"
    : "https://api.resend.com/emails";
  const resendBody = submission.sendCopy
    ? [
        internalEmail,
        {
          from: env.FIT_CHECK_FROM_EMAIL,
          to: [submission.email],
          reply_to: env.FIT_CHECK_TO_EMAIL,
          subject: "Your Cadence Lab Fit Check answers",
          text: formatSubmitterCopy(submission),
        },
      ]
    : internalEmail;
  let resendResponse: Response;

  try {
    resendResponse = await fetch(resendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(resendBody),
    });
  } catch (error) {
    console.error("Fit Check email delivery request failed.", error);
    return textResponse(
      "We could not send your Fit Check. Your information was not delivered. Please go back and try again.",
      502,
    );
  }

  if (!resendResponse.ok) {
    console.error("Resend rejected the Fit Check email request.", {
      status: resendResponse.status,
      requestId: resendResponse.headers.get("x-request-id"),
    });
    return textResponse(
      "We could not send your Fit Check. Your information was not delivered. Please go back and try again.",
      502,
    );
  }

  return Response.redirect(new URL("/thanks/", request.url), 303);
};
