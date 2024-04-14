import { useState, useEffect } from 'react';

import toast from 'react-hot-toast';

import * as collaboration from '../api/collaboration';

const Inbox = () => {
  const [dataChanged, setDataChanged] = useState(false);
  const [invites, setInvites] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = localStorage.getItem('user');
      if (user === null) {
        return;
      }

      try {
        const response = await collaboration.getInvitationsToUser(user);
        setInvites(response.filter(i => i.accepted === false));  
      } catch(err) {
        toast.error(`${err}`);
      }
    };

    fetchData().catch(console.error);

    setDataChanged(false);
  }, [dataChanged]);

  const accept = async (projectId, projectTitle) => {
    try {
      await collaboration.acceptInvitation(projectId);

      toast.success(`Invitation to ${projectTitle} accepted.`);
    } catch(err) {
      toast.error(`${err}`);
    }

    setDataChanged(true);
  }

  const decline = async (projectId, projectTitle) => {
    try {
      const username = localStorage.getItem('user');
      await collaboration.withdrawInvitation(username, projectId);

      // This isn't an error but it makes sense to show a red icon on decline
      // and a green one on accept.
      toast.error(`Invitation to ${projectTitle} declined.`);
    } catch(err) {
      toast.error(`${err}`);
    }

    setDataChanged(true);
  }

  return (
    <div className="flex flex-col w-full px-8 pt-6 pb-4 mb-4 space-y-2">
      <div className="max-h-[250px] overflow-auto divide-y-2">
        {
          invites != null && invites.length > 0
            ? invites.map(i =>
              <div className="flex space-x-5 hover:bg-white rounded-md p-2" key={i.project_id}>
                <div className="grow">
                  You have been invited to collaborate on <div className="italic font-bold">{i.title}</div>
                  <div className="text-xs">{(new Date(i.last_modified)).toLocaleString()}</div>
                </div>
                <div className="flex space-x-3">
                  <div title="Accept" className="hover:cursor-pointer" onClick={() => accept(i.project_id, i.title)}>✔️</div>
                  <div title="Decline" className="hover:cursor-pointer" onClick={() => decline(i.project_id, i.title)}>❌</div>
                </div>
              </div>
            )
            : "No Messages."
        }
      </div>
    </div>
  );
};

export default Inbox;
