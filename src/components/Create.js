import { useState } from "react";
import { Form } from "react-bootstrap";
import {Button} from "react-bootstrap";
import {Spinner} from "react-bootstrap";
import { ethers } from "ethers";

const CreateNewProposal = ({provider, dao, setIsLoading}) => {
    const [name, setName] = useState('')
    const [amount, setAmount] = useState(0)
    const [address, setAddress] = useState('')

    // pass events into onSubmit handler
    // e.preventDefault() - keeps page from refreshing after form submission
    const createHandler = async (e) => {
        e.preventDefault()
        console.log('Creating new proposal...', name, amount, address)
    }
    return(
        <Form onSubmit={createHandler}>
            <Form.Group style={{maxWidth: '450px', margin: '50px auto'}}>
                <Form.Control
                    type="text"
                    placeholder="Enter name"
                    className="my-2"
                    onChange={(e) => setName(e.target.value)}
                />
                <Form.Control
                    type="number"
                    placeholder="Enter amount"
                    className="my-2"
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Form.Control
                    type="text"
                    placeholder="Enter address"
                    className="my-2"
                    onChange={(e) => setAddress(e.target.value)}
                />
            <Button
                variant="primary"
                type="submit"
                style={{width: '100%'}}
            >
                Create New Proposal
            </Button>
            </Form.Group>
            
        </Form>
    )
}

export default CreateNewProposal;