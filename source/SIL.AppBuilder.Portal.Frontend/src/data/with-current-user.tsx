import * as React from 'react';
import { withData, WithDataProps } from 'react-orbitjs';
import { compose } from 'recompose';
import { UserAttributes, TYPE_NAME } from '@data/models/user';
import { MapRecordsToProps } from '../../types/react-orbitjs/index';

type UserPayload = JSONAPI<UserAttributes>;

const mapRecordsToProps = {
    currentUser: q => q.findRecord({ id: '', type: TYPE_NAME })
}

export function withCurrentUser() {
    return InnerComponent => {
        class WrapperClass extends React.Component<{currentUser: UserPayload } & WithDataProps, { currentUser: UserPayload }> {
            state = { currentUser: undefined };

            componentDidMount() {
                const { currentUser } = this.props;

                console.log('hello');
                if (currentUser) {
                    this.setState({ currentUser });
                    return;
                }

                // This is where we'd probably want to handle user is disabled / deactivated logic
                // or maybe the server would throw some error code at us or something
                // TODO: user is inactive stuff
            }

            render() {
                if (this.state.currentUser) {
                    return <InnerComponent {...this.props} />;
                } else {
                    return 'Loading? what should we do here before we get the current user?';
                }
            }
        }

        return compose(
            withData(mapRecordsToProps)
        )(WrapperClass);
    }
}