import React from 'react';
import styled from 'styled-components';

const TermsContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;

  h1 {
    color: #333;
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
  }
`;

const TermsContent = styled.div`
  line-height: 1.6;

  section {
    margin-bottom: 2rem;
  }

  h2 {
    color: #444;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  p {
    color: #666;
    margin-bottom: 1rem;
  }

  ul {
    list-style-type: disc;
    margin-left: 2rem;
    margin-bottom: 1rem;
  }

  li {
    color: #666;
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.3rem;
    }
  }
`;

const TermsAndConditions = () => {
  return (
    <TermsContainer>
      <h1>Terms and Conditions</h1>
      <TermsContent>
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the Bajaj Earths system, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the system.</p>
        </section>

        <section>
          <h2>2. User Responsibilities</h2>
          <p>As a user of the system, you agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Use the system in compliance with all applicable laws</li>
            <li>Report any security breaches or unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2>3. System Usage</h2>
          <p>The system is provided for authorized business purposes only. Users must not:</p>
          <ul>
            <li>Share access credentials with unauthorized persons</li>
            <li>Attempt to bypass security measures</li>
            <li>Use the system for any illegal activities</li>
            <li>Interfere with system operations</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Management</h2>
          <p>Users are responsible for:</p>
          <ul>
            <li>Ensuring data accuracy and completeness</li>
            <li>Maintaining appropriate backups</li>
            <li>Following data retention policies</li>
            <li>Protecting sensitive information</li>
          </ul>
        </section>

        <section>
          <h2>5. System Availability</h2>
          <p>While we strive to maintain system availability, we do not guarantee uninterrupted access. We reserve the right to perform maintenance and updates as needed.</p>
        </section>

        <section>
          <h2>6. Modifications</h2>
          <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes. Continued use of the system after changes constitutes acceptance of the modified terms.</p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>For questions regarding these Terms and Conditions, please contact:</p>
          <p>Email: legal@bajajearths.com</p>
        </section>
      </TermsContent>
    </TermsContainer>
  );
};

export default TermsAndConditions; 