frappe.pages['student-attendace-pa'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Student Attendace',
		single_column: true
	});
	$(wrapper).find('.layout-main-section').html(`
		<div class="p-4">
			<div class="mb-4">
				<label>Date:</label>
				<input style="width:50%" type="date" id="attendace-date" class="form-control" value="${frappe.datetime.get_today()}"/>
			</div>
			<div id="student-list"></div>
			<button class="btn btn-primary mt-3" id="save-attendance">Save Attendace</button>
		</div>
		
		`);
		load_students();
		
$(document).on('click', '#save-attendance', function () {
		const date = $('#attendance-date').val();
		const data = [];

		$('.student-row').each(function () {
			const student = $(this).data('student');
			const status = $(this).find('select').val();
			data.push({ student, date, status });
		});
	});

	function load_students() {
	frappe.call({
		method: "test_app.test_app.page.student_attendace_pa.student_attendace_pa.get_students_via_sql",
		callback: function (r) {
			const students = r.message;
			let html = `
				<table class="table table-bordered">
					<thead><tr><th>Student</th><th>Status</th></tr></thead>
					<tbody>
			`;

			students.forEach(s => {
				html += `
					<tr class="student-row" data-student="${s.name}">
						<td>${s.student_name}</td>
						<td>
							<select class="form-control">
								<option value="Present">Present</option>
								<option value="Absent">Absent</option>
								<option value="Leave">Leave</option>
							</select>
						</td>
					</tr>
				`;
			});

			html += `</tbody></table>`;
			$('#student-list').html(html);
		}
	});
}
};

