import type { EmailType } from '@prisma/client';
// import { AppError } from './AppError';
import { getEmailTemplateByType } from '../middlewares/getEmailTemplateByType';
import { emailTemplateWrapper } from './emailTemplateWrapper';

export const renderTemplate = async <
  T extends Record<string, string | number | boolean | undefined | unknown>,
>(
  emailType: EmailType,
  data: T,
  options?: { optionalFields?: string[] }
): Promise<{ body: string | null; subject: string | null }> => {
  // 1. Get template by type
  const template = await getEmailTemplateByType(emailType);
  console.log('Template', options);

  if (!template) {
    return { body: null, subject: null };
  }

  // 2. Parse template variables
  // const templateVars: Record<string, string> = template.variables
  //   ? typeof template.variables === 'string'
  //     ? JSON.parse(template.variables)
  //     : template.variables
  //   : {};

  // 3. Get all template keys
  // const allKeys = Object.keys(templateVars);

  // 4. Get data keys (filter out undefined values)
  // const dataKeys = Object.keys(data).filter(
  //   key => data[key] !== null && data[key] !== undefined
  // );

  // 5. Determine required fields
  // const required = allKeys.filter(
  //   key => !options?.optionalFields?.includes(key)
  // );

  // 6. Find missing required fields
  // const missing = required.filter(key => !dataKeys.includes(key));

  // 7. Only validate missing fields (ignore extra fields)
  // if (missing.length) {
  //   throw new AppError(
  //     `Missing: ${missing.join(', ')}`,
  //     'VALIDATION_FAILED',
  //     400
  //   );
  // }

  // 8. Replace variables
  const templateBody = template.body.replace(/\$\{([^}]+)\}/g, (_, key) => {
    const value = data[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      return Array.isArray(value)
        ? value
            .map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v)))
            .join(', ')
        : JSON.stringify(value);
    }
    return String(value);
  });

  // 9. Wrap with email layout
  const body = emailTemplateWrapper(templateBody);

  return {
    body,
    subject: template.subject,
  };
};

// export const renderTemplate = async <
//   T extends Record<string, string | number | boolean | undefined | unknown>,
// >(
//   emailType: EmailType,
//   data: T,
//   options?: { optionalFields?: string[] }
// ): Promise<{ body: string | null; subject: string | null }> => {
//   console.log('data:', data);
//
//   // 1. Get template by type
//   const template = await getEmailTemplateByType(emailType);
//
//   // If no template found, return empty
//   if (!template) {
//     return { body: null, subject: null };
//   }
//
//   // 2. Parse template variables (string or object)
//   const templateVars: Record<string, string> = template.variables
//     ? typeof template.variables === 'string'
//       ? JSON.parse(template.variables)
//       : template.variables
//     : {};
//
//   // 3. Get all template keys
//   const allKeys = Object.keys(templateVars);
//
//   // 4. Determine required fields
//   // Required = all template keys - optionalFields
//   // const required = allKeys.filter(
//   //   key => !options?.optionalFields?.includes(key)
//   // );
//   const required = allKeys.filter(
//     key => !options?.optionalFields?.includes(key)
//   );
//
//   // 5. Find missing required fields
//   // const missing = required.filter(key => !(key in data));
//   const missing = required.filter(
//     key => data[key] === null || data[key] === undefined
//   );
//
//   // 6. Find extra fields (not in template)
//   // const extra = Object.keys(data).filter(key => !(key in templateVars));
//   const extra = Object.keys(data).filter(key => !allKeys.includes(key));
//
//   // 7. Throw error if validation fails
//   // if (missing.length || extra.length) {
//   //   const msg = [
//   //     missing.length ? `Missing: ${missing.join(', ')}` : '',
//   //     extra.length ? `Unexpected: ${extra.join(', ')}` : '',
//   //   ]
//   //     .filter(Boolean)
//   //     .join(' | ');
//   //
//   //   throw new AppError(msg, 'VALIDATION_FAILED', 400);
//   // }
//   if (missing.length || extra.length) {
//     const msg = [
//       missing.length ? `Missing: ${missing.join(', ')}` : '',
//       extra.length ? `Unexpected: ${extra.join(', ')}` : '',
//     ]
//       .filter(Boolean)
//       .join(' | ');
//
//     throw new AppError(msg, 'VALIDATION_FAILED', 400);
//   }
//
//   // 8. Replace variables like ${name} with actual values
//   // const templateBody = template.body.replace(/\$\{([^}]+)\}/g, (_, key) =>
//   //   data[key] != null ? String(data[key]) : ''
//   // );
//   const templateBody = template.body.replace(/\$\{([^}]+)\}/g, (_, key) => {
//     const value = data[key];
//
//     if (value === null || value === undefined) return '';
//     return String(value);
//   });
//
//   // 9. Wrap with email layout (header/footer)
//   const body = emailTemplateWrapper(templateBody);
//
//   // 10. Return final result
//   return {
//     body,
//     subject: template.subject,
//   };
// };
