import React, { useState } from "react";
import { IonPage, IonCard, IonContent, IonItem, IonLabel, IonInput, IonButton, IonAlert, IonLoading, IonGrid, IonRow, IonCol } from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./Login1.css"; // Import your CSS file
import { g } from "vitest/dist/chunks/suite.d.FvehnV49";



const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertMsg("Please fill all fields");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save access token in localStorage or context
        localStorage.setItem("access_token", data.access_token);
        // setAlertMsg("Login successful!");
        // setShowAlert(true);

        setTimeout(() => {
          history.push("/home"); // Redirect after success
        }, 1000);
      } else {
        setAlertMsg(data.error || "Invalid credentials");
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMsg("Something went wrong. Please try again.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    history.push("/register"); // Redirect to register page
  };

  return (
    <IonPage>
      <IonContent fullscreen className="test-card">

        <IonCard className="login-card ion-padding">
          <IonItem className="ion-margin-top" style={{ width: "90%", padding: "10px 10px"}} >
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              style ={{ 
                marginTop: "10px"
              }}
              value={email}
              onIonChange={e => setEmail(e.detail.value!)}
              type="email"
              required
            />
          </IonItem>

          <IonItem className="ion-margin-top" style={{ width: "90%", padding: "10px 10px"}}>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput 
              style ={{ marginTop: "10px" }}
              value={password}
              onIonChange={e => setPassword(e.detail.value!)}
              type="password"
              required
            />
          </IonItem>

          <IonGrid>
            <IonRow className="ion-justify-content-center">
              <IonCol size="auto">
                <IonButton style={{ width: "120px" }} onClick={handleLogin}>Login</IonButton>
              </IonCol>
              <IonCol size="auto">
                <IonButton style={{ width: "120px" }} onClick={handleRegister}>Register</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonLoading isOpen={loading} message="Logging in..." />
          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header="Login"
            message={alertMsg}
            buttons={["OK"]}
          />
        </IonCard>

      </IonContent>
    </IonPage>

  );
};

export default Login;
