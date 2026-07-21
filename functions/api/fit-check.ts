interface Env {
  RESEND_API_KEY?: string;
  FIT_CHECK_TO_EMAIL?: string;
  FIT_CHECK_FROM_EMAIL?: string;
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

const environmentOptions: Record<string, string> = {
  fragmented: "Multiple disconnected systems and inconsistent workflows",
  transitioning: "Systems or processes are currently being consolidated",
  "modern-siloed": "Modern tools exist, but teams or workflows remain siloed",
  established: "Core systems and workflows are established but need improvement",
  uncertain: "We need help understanding the current state",
};

const crmOptions: Record<string, string> = {
  measured: "CRM data is connected to workflows and performance measures",
  "active-limited": "Data is collected, but its operational use is limited",
  fragmented: "Data quality or ownership is inconsistent across teams",
  early: "CRM use is still developing",
  unknown: "We are not sure how reliable or useful the data is",
};

const leadershipOptions: Record<string, string> = {
  yes: "Yes, an accountable sponsor is involved",
  developing: "Support exists, but ownership is still developing",
  no: "No, we are still building internal alignment",
};

const readinessOptions: Record<string, string> = {
  yes: "Yes, workflow changes are within scope",
  limited: "Possibly, depending on the recommendation",
  no: "No, the current process must remain largely unchanged",
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
    errors.push(`${label} must be ${max.toLocaleString()} characters or fewer.`);
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
    "Primary platform",
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
    "",
    "CURRENT SITUATION",
    `Primary challenge: ${submission.challenge}`,
    "",
    `Business impact: ${submission.impact}`,
    "",
    "OPERATING ENVIRONMENT",
    `Environment: ${submission.environment}`,
    `Primary platform: ${submission.crm}`,
    "",
    "READINESS",
    `Leadership alignment: ${submission.leadership}`,
    `Timing: ${submission.changeReadiness}`,
    "",
    "ADDITIONAL CONTEXT",
    submission.additionalContext || "Not provided",
  ].join("\n");
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

  let formData: FormData;
  try {
    formData = await request.formData();
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
  let resendResponse: Response;

  try {
    resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FIT_CHECK_FROM_EMAIL,
        to: [env.FIT_CHECK_TO_EMAIL],
        reply_to: submission.email,
        subject: `Fit Check: ${subjectOrganization} — ${subjectName}`,
        text: formatSubmission(submission),
      }),
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
