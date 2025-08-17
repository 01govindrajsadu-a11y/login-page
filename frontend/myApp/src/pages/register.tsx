import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonLoading,
  IonText,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const history = useHistory();

  const handleRegister = async () => {
    setError("");
    setSuccessMsg("");

    if (!name || !email || !phoneNum || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone_num: phoneNum,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        // setSuccessMsg("Registration successful! You can now log in.");
        setName("");
        setEmail("");
        setPhoneNum("");
        setPassword("");
        history.push("/login");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="secondary">
          <IonTitle>Register</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard style = {{ borderRadius: "15px"}}>
          <IonCardHeader>
            <IonCardTitle>Create Account</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {error && (
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
            )}
            {successMsg && (
              <IonText color="success">
                <p>{successMsg}</p>
              </IonText>
            )}

            <IonItem>
              <IonLabel position="floating">Full Name</IonLabel>
              <IonInput
                style ={{ marginTop: "15px" }}
                type ="text"
                value={name}
                onIonChange={(e) => setName(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput
                style ={{ marginTop: "15px" }}
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Phone Number</IonLabel>
              <IonInput
                style ={{ marginTop: "15px" }}
                type="tel"
                value={phoneNum}
                onIonChange={(e) => setPhoneNum(e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                style ={{ marginTop: "15px" }}
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>

            <IonButton
              // expand="block"
              // style={{marginRight: "0px"}}
              className="ion-margin-top"
              onClick={handleRegister}
            >
              Register
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={loading} message="Registering..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;
