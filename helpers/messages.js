class MessagesHelper {
    static accountRequestTable(form) {
        return `
            <table style="width: 100%">
                <tr>
                    <td colspan="2" style="padding-bottom: 10px;"><b>User details</b></td>
                </tr>
                <tr>
                    <td>First name: ${form.data.firstname}</td>
                    <td>Email: ${form.data.email}</td>
                </tr>
                <tr>
                    <td>Surname: ${form.data.surname}</td>
                    <td>Organisation: ${form.data.organisation}</td>
                </tr>
                <tr>
                    <td>Professional role: ${form.data.professional_role}</td>
                    <td>Professional number: ${form.data.professional_number}</td>
                </tr>

                <tr>
                    <td colspan="2" style="padding: 10px 0px;"><b>Patient identifiable access</b></td>
                </tr>
                <tr>
                    <td>Patient's registered GP practice:  ${form.data.pid_access.patient_gps == "" ? "n/a" : form.data.pid_access.patient_gps}</td>
                    <td>Patient's community health service: ${form.data.pid_access.patient_chs == "" ? "n/a" : form.data.pid_access.patient_chs}</td>
                </tr>
                <tr>
                    <td>Related community hub: ${form.data.pid_access.related_ch == "" ? "n/a" : form.data.pid_access.related_ch}</td>
                    <td>Related multi-discplinary team: ${form.data.pid_access.related_mdt.length ? form.data.pid_access.related_mdt.join(', ') : "n/a"}</td>
                </tr>
                <tr>
                    <td colspan="2">Citizen local authority/district council: ${form.data.pid_access.citizen_council == "" ? "n/a" : form.data.pid_access.citizen_council}</td>
                </tr>

                <tr>
                    <td colspan="2" style="padding: 10px 0px;"><b>Apps requested</b></td>
                </tr>
                <tr>
                    <td colspan="2">${form.data.app_access.join(', ')}</td>
                </tr>
            </table>`;
    }
}

module.exports  = MessagesHelper;
