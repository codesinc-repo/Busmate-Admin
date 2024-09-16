import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';

const SearchFilter = ({ searchTerm, setSearchTerm, fields }) => {
  const handleChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  const handleFields = (fields) => {

    if(fields === undefined){
        return " ";
    }
    else {
        return fields.join(", ");
    }
  }
  return (
    <Form.Group controlId="search" className="mb-3">
      <Form.Control
        type="text"
        placeholder={`Search by ${handleFields(fields)}`}
        value={searchTerm}
        onChange={handleChange}
      />
    </Form.Group>
  );
};

SearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SearchFilter;
