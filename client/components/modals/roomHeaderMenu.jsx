import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as bi from 'react-icons/bi';
import { setModal } from '../../redux/features/modal';
import { setPage } from '../../redux/features/page';
import { setChatRoom } from '../../redux/features/room';

function RoomHeaderMenu() {
  const dispatch = useDispatch();

  const { roomType, profile, group } = useSelector((state) => state.room.chat.data);
  const modal = useSelector((state) => state.modal);

  const isGroup = roomType === 'group';

  return (
    <div
      className={`${modal.roomHeaderMenu ? 'z-10' : 'scale-0 -z-10'} transition absolute right-0 top-0 w-52 py-2 rounded-md shadow-xl -translate-x-6 translate-y-14 bg-white dark:bg-spill-700`}
      aria-hidden
      onClick={(e) => e.stopPropagation()}
    >
      <div className="grid">
        {
          [
            {
              _key: 'k-01',
              html: isGroup ? 'Group info' : 'Contact info',
              icon: <bi.BiInfoCircle />,
              action() {
                const query = {};

                query.target = isGroup ? 'groupProfile' : 'friendProfile';
                query.data = isGroup ? group._id : profile.userId;

                dispatch(setPage(query));
              },
              style: '',
            },
            {
              _key: 'k-02',
              html: 'Close chat',
              icon: <bi.BiArrowBack />,
              action() {
                dispatch(setChatRoom({
                  isOpen: false,
                  refreshId: null,
                  data: null,
                }));
              },
              style: '',
            },
            {
              _key: 'k-03',
              html: 'Select messages',
              icon: <bi.BiCheckCircle />,
              action() {},
              style: '',
            },
            {
              _key: 'k-04',
              html: 'Delete chat',
              icon: <bi.BiTrashAlt />,
              action() {},
              style: isGroup ? 'hidden' : 'block text-rose-600 dark:text-rose-400',
            },
            {
              _key: 'k-05',
              html: 'Leave group',
              icon: <bi.BiExit />,
              action() {},
              style: isGroup ? 'block text-rose-600 dark:text-rose-400' : 'hidden',
            },
          ].map((elem) => (
            <button
              key={elem._key}
              type="button"
              className={`${elem.style} py-2 px-4 flex gap-4 items-center cursor-pointer hover:bg-spill-200 dark:hover:bg-spill-600`}
              onClick={() => {
                dispatch(setModal({ target: 'roomHeaderMenu' }));
                setTimeout(() => elem.action(), 150);
              }}
            >
              <i className="opacity-40">{elem.icon}</i>
              <p>{elem.html}</p>
            </button>
          ))
        }
      </div>
    </div>
  );
}

export default RoomHeaderMenu;
