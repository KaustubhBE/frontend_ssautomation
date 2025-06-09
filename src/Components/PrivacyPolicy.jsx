import React from 'react';
import styled from 'styled-components';

const PolicyContainer = styled.div`
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

const PolicyContent = styled.div`
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

const PrivacyPolicy = () => {
  return (
    <PolicyContainer>
      <h1>Privacy Policy</h1>
      <PolicyContent>
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including but not limited to:</p>
          <ul>
            <li>Name and contact information</li>
            <li>Employee identification details</li>
            <li>Usage data and preferences</li>
            <li>System access logs</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li>Providing and maintaining our services</li>
            <li>Processing your requests and transactions</li>
            <li>Improving our services</li>
            <li>Ensuring system security</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2>4. Data Retention</h2>
          <p>We retain your information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.</p>
        </section>

        <section>
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
          </ul>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <p>Email: privacy@bajajearths.com</p>
        </section>
      </PolicyContent>
    </PolicyContainer>
  );
};

export default PrivacyPolicy; 