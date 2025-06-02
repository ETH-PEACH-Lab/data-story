import { useState, useEffect } from "react";

const passkey = '123456';

function generateRandomName() {
    const adjectives = ["Quick", "Lazy", "Clever", "Brave", "Happy"];
    const animals = ["Fox", "Hawk", "Otter", "Lion", "Panda"];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adjective}${animal}${Math.floor(Math.random() * 1000)}`;
}

export const Authentication = ({ onAuthenticated }) => {
    const [name, setName] = useState('');
    const [enteredPasskey, setEnteredPasskey] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const randomName = generateRandomName();
            setName(randomName);
            onAuthenticated(randomName);
        }
    }, [onAuthenticated]);

    const handleLogin = () => {
        if (enteredPasskey === passkey) {
            onAuthenticated(name);
        } else {
            setErrorMessage('Incorrect passkey. Please try again.');
        }
    };

    // Only render form if not in dev mode
    if (process.env.NODE_ENV === 'development') {
        return null;
    }

    return (
        <div className="auth-container">
            <h2>Please enter your name and the passkey</h2>
            <div>
                <label>Name: </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <label>Passkey: </label>
                <input
                    type="password"
                    value={enteredPasskey}
                    onChange={(e) => setEnteredPasskey(e.target.value)}
                />
            </div>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <button onClick={handleLogin}>Submit</button>
        </div>
    );
};
