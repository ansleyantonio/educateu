export const emailTemplateWrapper = (body: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email</title>

  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
      .padding {
        padding: 16px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background:#f4f7fb;">

  <!-- Full width background table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;">
    <tr>
      <td align="center" style="padding:20px;">

        <!-- Responsive container -->
        <table 
          role="presentation"
          class="container"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden;"
        >
          <tr>
            <td class="padding" style="padding:24px;">
              ${body}
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
