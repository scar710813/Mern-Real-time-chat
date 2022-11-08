import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import * as ri from 'react-icons/ri';
import socket from '../../../helpers/socket';
import { setRoom } from '../../../redux/features/chat';

function Inbox() {
  const dispatch = useDispatch();
  const master = useSelector((state) => state.user.master);
  const [inboxs, setInboxs] = useState(null);

  const handleGetInboxs = async (signal) => {
    try {
      const { data } = await axios.get('/inboxs', { signal });
      setInboxs(data.payload);
    }
    catch (error0) {
      console.error(error0.response.data.message);
    }
  };

  useEffect(() => {
    const abortCtrl = new AbortController();
    handleGetInboxs(abortCtrl.signal);

    socket.on('inbox/find', (payload) => {
      // concat old inboxs data with new data
      setInboxs((prev) => {
        const olds = prev.filter((elem) => elem._id !== payload._id);
        return [payload, ...olds];
      });

      if (payload.content.from !== master._id) {
        const audio = new Audio('assets/sound/default-ringtone.mp3');
        audio.volume = 1;

        audio.play();
      }
    });

    socket.on('inbox/read', (payload) => {
      setInboxs((prev) => {
        const index = prev.findIndex((elem) => elem._id === payload._id);
        prev.splice(index, 1, payload);

        return [...prev];
      });
    });

    return () => {
      abortCtrl.abort();
      socket.off('inbox/find');
      socket.off('inbox/read');
    };
  }, []);

  return (
    <div className="-z-10 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:bg-spill-900">
      {
        inboxs && inboxs.map((elem) => (
          <div
            key={elem._id}
            aria-hidden
            className="p-4 grid grid-cols-[auto_1fr] gap-4 items-center cursor-default border-0 border-b border-solid border-spill-200 dark:border-spill-800 hover:bg-spill-100/60 dark:hover:bg-spill-800/60"
            onClick={() => {
              const profile = elem.owners.find((x) => x.userId !== master._id);

              dispatch(setRoom({
                ownersId: elem.ownersId,
                roomId: elem.roomId,
                profile: !profile
                  ? {
                    avatar: 'default-avatar.png',
                    fullname: '[inactive]',
                    updatedAt: new Date().toISOString(),
                    active: false,
                  }
                  : {
                    ...profile,
                    active: true,
                  },
              }));
            }}
          >
            <img
              src={`assets/images/${elem.owners.find((x) => x.userId !== master._id)?.avatar ?? 'default-avatar.png'}`}
              alt={`assets/images/${elem.owners.find((x) => x.userId !== master._id)?.avatar ?? 'default-avatar.png'}`}
              className="w-14 h-14 rounded-full"
            />
            <div className="overflow-hidden grid gap-0.5">
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <p className="text-lg font-bold truncate">{elem.owners.find((x) => x.userId !== master._id)?.fullname || '[inactive]'}</p>
                <p className="text-sm opacity-60">{moment(elem.content.time).fromNow()}</p>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <span className="flex gap-1 items-center overflow-hidden">
                  { elem.content.from === master._id && (
                    <i>
                      {
                        elem.unreadMessage === 0
                          ? <ri.RiCheckDoubleFill size={20} className="text-sky-600 dark:text-sky-400" />
                          : <ri.RiCheckFill size={20} />
                      }
                    </i>
                  ) }
                  <p className="truncate">{elem.content.text}</p>
                </span>
                {
                  ((elem.content.from !== master._id) && elem.unreadMessage > 0) && (
                    <span className="w-5 h-5 flex justify-center items-center rounded-full bg-spill-200 dark:bg-spill-700">
                      <p className="text-sm">{elem.unreadMessage}</p>
                    </span>
                  )
                }
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default Inbox;
