pragma solidity ^0.8.13;
// SPDX-License-Identifier: MIT

contract HostelComplaintSystem {

    enum Status { Pending, InProgress, Completed }

    struct Complaint {
        uint id;
        address student;
        string image;       // optional (can be empty string)
        string text;
        string blockName;
        uint floorNo;
        string roomNo;      // optional
        string category;
        Status status;
        uint timestamp;     // for 3-day check in JS
        uint reopenCount;   // how many times reopened
        string[] feedbacks; // feedback when marked Unsatisfied
    }

    uint public complaintCounter;
    mapping(uint => Complaint) public complaints;

    // Events for frontend tracking
    event ComplaintRaised(uint id, address student);
    event StatusChanged(uint id, Status newStatus);
    event ComplaintReopened(uint id, uint reopenCount, string feedback);

    // Raise a new complaint
    function raiseComplaint(
        string memory _image,
        string memory _text,
        string memory _blockName,
        uint _floorNo,
        string memory _roomNo,
        string memory _category
    ) public {
        complaintCounter++;
        Complaint storage c = complaints[complaintCounter];
        c.id = complaintCounter;
        c.student = msg.sender;
        c.image = _image;
        c.text = _text;
        c.blockName = _blockName;
        c.floorNo = _floorNo;
        c.roomNo = _roomNo;
        c.category = _category;
        c.status = Status.Pending;
        c.timestamp = block.timestamp;
        c.reopenCount = 0;

        emit ComplaintRaised(complaintCounter, msg.sender);
    }

    // Change complaint status (anyone can call, frontend will restrict in JS)
    function changeStatus(uint _id, Status _newStatus) public {
        Complaint storage c = complaints[_id];
        require(_id > 0 && _id <= complaintCounter, "Invalid complaint ID");
        c.status = _newStatus;
        c.timestamp = block.timestamp; // refresh timestamp
        emit StatusChanged(_id, _newStatus);
    }

    // Submit review (Satisfied / Unsatisfied)
    function submitReview(uint _id, bool satisfied, string memory feedback) public {
        Complaint storage c = complaints[_id];
        require(_id > 0 && _id <= complaintCounter, "Invalid complaint ID");
        require(c.status == Status.Completed, "Complaint not resolved yet");

        if (satisfied) {
            // Complaint remains completed
            return;
        } else {
            // Unsatisfied → reopen, max 3 times
            require(c.reopenCount < 3, "Complaint cannot be reopened more than 3 times");
            c.reopenCount++;
            c.status = Status.Pending;
            c.timestamp = block.timestamp;
            c.feedbacks.push(feedback);

            emit ComplaintReopened(_id, c.reopenCount, feedback);
        }
    }

    // Fetch all complaints
    function getAllComplaints() public view returns (Complaint[] memory) {
        Complaint[] memory list = new Complaint[](complaintCounter);
        for (uint i = 1; i <= complaintCounter; i++) {
            list[i-1] = complaints[i];
        }
        return list;
    }

    // Fetch feedbacks for a complaint
    function getFeedbacks(uint _id) public view returns (string[] memory) {
        require(_id > 0 && _id <= complaintCounter, "Invalid complaint ID");
        return complaints[_id].feedbacks;
    }
}
