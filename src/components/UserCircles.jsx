import { useState, useEffect } from "react";

export const UserCircles = ({ awareness }) => {
    const [collaborators, setCollaborators] = useState([]);

    useEffect(() => {
        if (!awareness || !awareness.current) return;

        const awarenessInstance = awareness.current;

        const handleAwarenessUpdate = () => {
            const states = awarenessInstance.getStates();
            const updatedCollaborators = Array.from(states.entries()).map(([clientID, state]) => {
                const name = state?.name || "Anon";
                const color = state?.cursor?.color || "#ccc";
                return { name, color };
            });
            setCollaborators(updatedCollaborators);
        };

        awarenessInstance.on("change", handleAwarenessUpdate);
        awarenessInstance.on("update", handleAwarenessUpdate);

        // Run once after hook mounts
        handleAwarenessUpdate();

        return () => {
            awarenessInstance.off("change", handleAwarenessUpdate);
            awarenessInstance.off("update", handleAwarenessUpdate);
        };
    }, [awareness?.current]);

    return (
        <div className="collaborators-container">
            {collaborators.map((collaborator, index) => (
                <div key={index} className="user-circle" style={{ backgroundColor: collaborator.color, color: 'white' }}>
                    {collaborator.name.charAt(0).toUpperCase()}
                </div>
            ))}
        </div>
    );
};
