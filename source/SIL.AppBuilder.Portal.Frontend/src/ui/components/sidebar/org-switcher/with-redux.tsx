import { connect } from "react-redux";

import { setCurrentOrganization } from '@store/data';

export interface IProvidedProps {
  setCurrentOrganizationId: (id: Id) => void;
}

const mapDispatchToProps = (dispatch) => ({
  setCurrentOrganizationId: (id) => dispatch(setCurrentOrganization(id))
});

export const withRedux = connect(null, mapDispatchToProps);