import { useState, useEffect } from "react";
import "./UserCircles.css";

export const CircleComponent = ({ collaborators, allCollaborators, setCollaborators }) => {

    const handleClick = (collaborator) => {
        const newCollaborators = collaborators.includes(collaborator.name)
            ? collaborators.filter(name => name !== collaborator.name)
            : [...collaborators, collaborator.name]
        setCollaborators(newCollaborators)
    }

    return <div className="collaborators-container">
        {allCollaborators.map((collaborator, index) => (
            <div
                key={index} className="user-circle"
                style={{
                    backgroundColor: collaborator.color, color: 'white',
                    border: collaborators.includes(collaborator.name) ? '4px solid rgb(232, 185, 49)' : 'none'
                }}
                onClick={() => handleClick(collaborator)}
            >
                {collaborator.name.charAt(0).toUpperCase()}
            </div>
        ))}
    </div>
}

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

    return <CircleComponent
        collaborators={[]}
        allCollaborators={collaborators}
        setCollaborators={() => { }}
    />
};
