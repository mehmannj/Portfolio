# EmailJS setup for this portfolio

This project uses EmailJS to send contact form messages. Below are step-by-step instructions to make messages arrive at `mannmehta003@gmail.com`.

1) Create an EmailJS account
   - Go to https://www.emailjs.com/ and sign up.

2) Add an Email Service
   - In EmailJS Dashboard -> Email Services, add a service (e.g., Gmail). Follow the provider steps to connect.
   - Note the Service ID (e.g. `service_abc123`).

3) Create an Email Template
   - Create a template (e.g. `template_contact`) that uses template variables:
     - `from_name`, `from_email`, `message`, `reply_to` (these are used by the component).
   - In the template's **To** field, set the recipient to `mannmehta003@gmail.com`.
     - Alternatively, to allow dynamic recipients, include a `to_email` variable in the template and use it from the code, but for security and simplicity set the recipient in the template.

4) Get your Public Key
   - In Integration -> API Keys, copy your `Public Key` (looks like `user_xxx` or a similar string).

5) Configure environment variables
   - Locally: create a `.env.local` in the project root with:
     ```env
     VITE_EMAILJS_SERVICE=service_abc123
     VITE_EMAILJS_TEMPLATE=template_contact
     VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
     ```
   - Netlify: in Site Settings -> Build & deploy -> Environment -> Environment variables, add the same keys.
   - GitHub Actions: add repository secrets and/or environment variables if using Actions builds.

6) How it works in the app
   - The contact form reads `VITE_EMAILJS_SERVICE`, `VITE_EMAILJS_TEMPLATE`, and `VITE_EMAILJS_PUBLIC_KEY`.
   - When the form is submitted the app calls EmailJS to send the template using the configured service.

7) Troubleshooting
   - If you see an error in the browser console when sending, open DevTools and check the network request and console errors.
   - Check EmailJS dashboard logs (Messages -> Sent) to see incoming requests and errors.
   - Make sure the template's recipient is set to `mannmehta003@gmail.com` so messages are delivered to that address.

If you want, I can commit the `.env.example` file showing the env keys (without values) and help you configure Netlify variables.
