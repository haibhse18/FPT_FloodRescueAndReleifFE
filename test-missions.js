const axios = require("axios");

async function testMissionsAPI() {
  const baseURL = "https://flood-rescue.onrender.com/api";
  try {
    // 1. Register a new Coordinator
    const email = `test_coord_${Date.now()}@example.com`;
    const phone = `090${Date.now().toString().slice(-7)}`;
    console.log(`Registering new Coordinator: ${email}, Phone: ${phone}`);
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      userName: "Test Coord",
      displayName: "Test Coordinator",
      email,
      password: "password123",
      phoneNumber: phone,
      role: "Rescue Coordinator",
    });
    console.log("Registered!");

    // 2. Login
    console.log("Logging in...");
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email,
      password: "password123",
    });
    const token = loginRes.data.accessToken || loginRes.data.data?.accessToken;
    console.log("Logged in!");

    // 3. Hit the missions API without query params
    console.log("Calling GET /missions without params...");
    const missionsRes = await axios.get(`${baseURL}/missions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(
      "Missions Response: Success",
      JSON.stringify(missionsRes.data, null, 2),
    );
  } catch (error) {
    if (error.response) {
      console.error("API Error Status:", error.response.status);
      console.error(
        "API Error Data:",
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error("Error:", error.message);
    }
  }
}

testMissionsAPI();
