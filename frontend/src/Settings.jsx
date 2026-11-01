
import React, { useState } from "react";

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("civiclens_user")) || {};
    } catch {
        return {};
    }
}

function getSavedNotifications() {
    try {
        return JSON.parse(localStorage.getItem("civiclens_notifications")) || {
            email: true,
            updates: true,
            resolved: true,
            community: false,
        };
    } catch {
        return {
            email: true,
            updates: true,
            resolved: true,
            community: false,
        };
    }
}

function Settings() {
    const user = getUser();

    const [notifications, setNotifications] = useState(getSavedNotifications);
    const [message, setMessage] = useState("");

    const toggleNotification = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = () => {
        localStorage.setItem(
            "civiclens_notifications",
            JSON.stringify(notifications)
        );
        setMessage("Notification preferences saved!");
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
                    Your details from your currently logged-in account.
                </p>

                {[
                    ["Name", user.name || "Not available"],
                    ["Email", user.email || "Not available"],
                    ["Role", user.role || "Citizen"],
                    ["Location", user.location || "Not set"],
                ].map(([label, value]) => (
                    <div key={label} style={{ marginBottom: "18px" }}>
                        <label style={labelStyle}>{label}</label>
                        <input
                            value={value}
                            readOnly
                            style={inputStyle}
                        />
                    </div>
                ))}
            </section>

            <section style={cardStyle}>
                <h2>🔔 Notification Preferences</h2>
                <p style={descriptionStyle}>
                    Choose which types of notifications you would like to receive.
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
                <p style={{ color: "#718096", fontSize: "12px", marginTop: "14px" }}>
                    These preferences are saved on this device. Actual email
                    and push notifications are not connected yet.
                </p>
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
                <p><strong>Account Type:</strong> {user.role || "Citizen"}</p>
            </section>

            {message && (
                <p style={{ color: "green", fontWeight: "600", marginBottom: "15px" }}>
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
    background: "#f8fafc",
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
