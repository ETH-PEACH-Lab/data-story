import { useState, useEffect } from "react";

export const UserCircles = ({ awareness }) => {

    const [collaborators, setCollaborators] = useState([]);

    useEffect(() => {
        const handleAwarenessUpdate = () => {
            const states = awareness.current.getStates();
            const updatedCollaborators = Array.from(states.entries()).map(([clientID, state]) => {
                const name = state.name; // Ensure a default name if not provided
                const color = state.cursor.color; // Get the cursor color
                return { name, color };
            });
            setCollaborators(updatedCollaborators);
        };

        awareness.current?.on('change', handleAwarenessUpdate);

        // Clean up listener when the component unmounts
        return () => {
            awareness.current.off('change', handleAwarenessUpdate);
        };
    }, [awareness.current]);

    return (
        <div className="collaborators-container">
            {collaborators.map((collaborator, index) => (
                <div key={index} className="user-circle" style={{ backgroundColor: collaborator.color, color: 'white' }}>
                    {collaborator.name.charAt(0).toUpperCase()}
                </div>
            ))}
        </div>
    );
}