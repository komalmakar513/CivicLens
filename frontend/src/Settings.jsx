
import React, { useState } from "react";

function Settings() {
    const [profile, setProfile] = useState({
        name: "Komal",
        email: "komalmakar513@gmail.com",
        role: "Citizen",
        location: "Chandigarh",
    });

    const [notifications, setNotifications] = useState({
        email: true,
        updates: true,
        resolved: true,
        community: false,
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const toggleNotification = (key) => {
        setNotifications({
            ...notifications,
            [key]: !notifications[key],
        });
    };

    const handleSave = () => {
        localStorage.setItem("civiclens_profile", JSON.stringify(profile));
        localStorage.setItem(
            "civiclens_notifications",
            JSON.stringify(notifications)
        );
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div style={{ padding: "28px", color: "#14213d" }}>
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
                    Settings
                </h1>
                <p style={{ color: "#718096" }}>
                    Manage your account and notification preferences.
                </p>
            </div>

            <section style={cardStyle}>
                <h2>👤 Profile Information</h2>
                <p style={descriptionStyle}>
                    Update your personal account information.
                </p>

                {["name", "email", "role", "location"].map((field) => (
                    <div key={field} style={{ marginBottom: "18px" }}>
                        <label style={labelStyle}>
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        <input
                            name={field}
                            value={profile[field]}
                            onChange={handleChange}
                            readOnly={field === "role"}
                            style={inputStyle}
                        />
                    </div>
                ))}
            </section>

            <section style={cardStyle}>
                <h2>🔔 Notification Preferences</h2>
                <p style={descriptionStyle}>
                    Choose which notifications you want to receive.
                </p>

                {[
                    ["email", "Email Notifications"],
                    ["updates", "Problem Status Updates"],
                    ["resolved", "Resolved Problem Alerts"],
                    ["community", "Community Activity"],
                ].map(([key, title]) => (
                    <div key={key} style={toggleRow}>
                        <span>{title}</span>
                        <input
                            type="checkbox"
                            checked={notifications[key]}
                            onChange={() => toggleNotification(key)}
                            style={{ width: "20px", height: "20px" }}
                        />
                    </div>
                ))}
            </section>

            <section style={cardStyle}>
                <h2>🏙️ About CivicLens</h2>
                <p style={descriptionStyle}>
                    CivicLens is a Community Problem Intelligence Platform
                    designed to help citizens report, track and resolve
                    public infrastructure problems.
                </p>
                <p><strong>Platform:</strong> CivicLens</p>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Account Type:</strong> Citizen</p>
            </section>

            {message && (
                <p style={{ color: "green", fontWeight: "600" }}>
                    {message}
                </p>
            )}

            <button onClick={handleSave} style={buttonStyle}>
                Save Changes
            </button>
        </div>
    );
}

const cardStyle = {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "14px",
    border: "1px solid #dce3ed",
    marginBottom: "22px",
};

const descriptionStyle = {
    color: "#718096",
    marginBottom: "22px",
};

const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    fontSize: "15px",
};

const toggleRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #edf0f5",
};

const buttonStyle = {
    background: "#06b6d4",
    color: "#ffffff",
    padding: "13px 28px",
    border: "none",
    borderRadius: "9px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "15px",
};

export default Settings;
