<script lang="ts">
	export let jwt: string
</script>

<div class="grow">
	<h2 class="">Admin Logs</h2>
	<table
		class="border-separate border-spacing-2 border border-slate-500 w-full">
		<thead>
			<tr>
				<th class="border border-slate-600">Person</th>
				<th class="border border-slate-600">Action</th>
				<th class="border border-slate-600">Date</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="border border-slate-700">Indiana</td>
				<td class="border border-slate-700">Indianapolis</td>
				<td class="border border-slate-700">Indianapolis</td>
			</tr>
			<tr>
				<td class="border border-slate-700">Ohio</td>
				<td class="border border-slate-700">Columbus</td>
				<td class="border border-slate-700">Indianapolis</td>
			</tr>
			<tr>
				<td class="border border-slate-700">Michigan</td>
				<td class="border border-slate-700">Detroit</td>
				<td class="border border-slate-700">Indianapolis</td>
			</tr>
		</tbody>
	</table>
</div>
