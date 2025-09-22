import React from 'react';
import { ProfileMenu } from '../../components/features/profile/ProfileMenu';
import { useAppSelector } from '../../hooks/useAppDispatch';

const Profile: React.FC = () => {
    const { user } = useAppSelector(state => state.auth);

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4">
                <ProfileMenu user={user} />
            </div>
        </div>
    );
};

export default Profile;
