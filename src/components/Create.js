import { useState } from "react";
import { Form } from "react-bootstrap";
import Button from "react-bootstrap";
import Spinner from "react-bootstrap";
import { ethers } from "ethers";

const CreateNewProposal = ({provider, dao, setIsLoading}) => {


    return(
        <Form>
            <Form.Group style={{maxWidth: '450px', margin: '50px auto'}}>
                <Form.Control type="text" placeholder="Enter name" className="my-2"/>
                <Form.Control type="number" placeholder="Enter amount" className="my-2"/>
                <Form.Control type="text" placeholder="Enter address" className="my-2"/>
            </Form.Group>
        </Form>
    )
}

export default CreateNewProposal;