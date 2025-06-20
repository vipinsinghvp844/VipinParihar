import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Card, Alert} from 'react-bootstrap'

function birthdayMessages() {
  const [birthdayMessages, setBirthdayMessages] = useState("");
   const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_CUSTOM_USERS}`)
      .then((response) => {
        const users = response.data;
        setTotalUsers(users.length);

        // Check for birthdays
        const today = new Date();
        const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;
        const birthdayMessages = [];

        users.forEach(user => {
          const dob = new Date(user.dob);
          const userMonthDay = `${dob.getMonth() + 1}-${dob.getDate()}`;
          if (userMonthDay === todayMonthDay) {
            birthdayMessages.push(`Today is ${user.first_name}'s Birthday!`);
          }
        });

        setBirthdayMessages(birthdayMessages);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setBirthdayMessages]);

  return (
    <div>
      {birthdayMessages.length > 0 && (
        <li>
          {birthdayMessages.map((message, index) => (
            <Alert key={index} variant="success">
              {message}
            </Alert>
          ))}
        </li>
      )}
    </div>
  );
}

export default birthdayMessages;
