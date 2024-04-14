import { useRef, useState, useEffect } from 'react';

import toast from 'react-hot-toast';

import * as collaboration from '../api/collaboration';

const Collab = ({ projectId }) => {
  const [dataChanged, setDataChanged] = useState(false);
  const [acceptedInvites, setAcceptedInvites] = useState(null);
  const inviteeTextRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (localStorage.getItem('user') === null) {
        return;
      }

      try {
        const invites = await collaboration.getProjectInvitations(projectId);
        setAcceptedInvites(invites.filter(i => i.accepted));
      } catch (err) {
        toast.error(`${err}`);
      }
    };

    fetchData().catch(console.error);
    setDataChanged(false);
  }, [dataChanged]);

  const invite = async () => {
    const invitee = inviteeTextRef.current.value;

    try {
      await collaboration.sendInvitation(invitee, projectId);
      toast.success(`Invite sent to ${invitee}!`);
    } catch (err) {
      toast.error(`${err}`);
    }
  }

  const removeCollaborator = async (username) => {
    try {
      await collaboration.withdrawInvitation(username, projectId);
      toast.error(`${username} removed from collaborators.`); // This is not an error but the icon makes sense.

      setDataChanged(true);
    } catch (err) {
      toast.error(`${err}`);
    }
  }

  return (
    <div className="flex flex-col w-full px-8 pt-6 pb-4 mb-4 space-x-5 space-y-10">
      <div className="max-h-[250px] overflow-auto divide-y">
        {
          acceptedInvites != null && acceptedInvites.length > 0
            ? acceptedInvites.map(i =>
              <div className="flex space-x-5 hover:bg-white rounded-md p-2" key={i.username}>
                <div className="grow">
                  <div className="font-bold">{i.username}</div>
                  <div className="text-xs">Since {(new Date(i.last_modified)).toLocaleString()}</div>
                </div>
                <div className="flex space-x-3">
                  <div title="Remove" className="hover:cursor-pointer" onClick={() => removeCollaborator(i.username)}>❌</div>
                </div>
              </div>
            )
            : ""
        }
      </div>

      <div className="flex space-x-5 justify-center">
        <input ref={inviteeTextRef}></input>
        <button onClick={async () => await invite()}>Invite</button>
      </div>
    </div>
  );
};

export default Collab;
