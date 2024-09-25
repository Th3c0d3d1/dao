import { Table } from "react-bootstrap";
import Button from "react-bootstrap";
import { ethers } from "ethers";

const Proposals = ({ provider, dao, proposals, quorum, setIsLoading }) => {
    console.log(proposals)
    return(
        <Table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Proposal Name</th>
                    <th>Recipient Addresss</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Total Votes</th>
                    <th>Cast Vote</th>
                    <th>Finalize</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </Table>
    )
}

export default Proposals;