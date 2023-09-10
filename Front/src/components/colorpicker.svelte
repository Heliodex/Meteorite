<script lang="ts">
	let bodypart = "all"
	let color: any
	export let jwt: string
	import { toastStore } from "@skeletonlabs/skeleton"
	import type { ToastSettings } from "@skeletonlabs/skeleton"
	const t: ToastSettings = {
		message: "resp",
		// Optional: Presets for primary | secondary | tertiary | warning
		preset: "primary",
		// Optional: The auto-hide settings
		autohide: true,
		timeout: 2000,
	}
	async function changebodycolor() {
		const changebodycolorresp = await fetch("/api/bodycolorupdate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				Type: bodypart,
				color: color,
			}),
		})
		const changebodycolorjson = await changebodycolorresp.json()
		t.message = changebodycolorjson.error ?? changebodycolorjson.message
		if (!changebodycolorjson.error) {
			t.preset = "primary"
		} else {
			t.preset = "error"
		}
		toastStore.trigger(t)
	}

	$: if (bodypart && color) {
		changebodycolor()
		color = undefined
	}
</script>

<h5>Skin Tone by Body Parts</h5>

<div class="flex flex-row">
	<div class="space-y-2 grow truncate p-2">
		<label>
			<input type="radio" bind:group={bodypart} value="all" />
			All
		</label>

		<label>
			<input type="radio" bind:group={bodypart} value="Head" />
			Head
		</label>

		<label>
			<input type="radio" bind:group={bodypart} value="Torso" />
			Torso
		</label>

		<label>
			<input type="radio" bind:group={bodypart} value="Left Arm" />
			Left Arm
		</label>

		<label>
			<input type="radio" bind:group={bodypart} value="Right Arm" />
			Right Arm
		</label>

		<label>
			<input type="radio" bind:group={bodypart} value="Left Leg" />
			Left Leg
		</label>

		<label>
			<input type="radio" bind:group={bodypart} value="Right Leg" />
			Right Leg
		</label>
	</div>
	<div
		class=" overflow-y-scroll gap-2 h-96 grid grid-cols-10 grid-flow-row auto-cols-max">
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1"
			style="background-color:rgb(242, 243, 243);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="2"
			style="background-color:rgb(161, 165, 162);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="3"
			style="background-color:rgb(249, 233, 153);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="5"
			style="background-color:rgb(215, 197, 154);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="6"
			style="background-color:rgb(194, 218, 184);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="9"
			style="background-color:rgb(232, 186, 200);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="11"
			style="background-color:rgb(128, 187, 219);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="12"
			style="background-color:rgb(203, 132, 66);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="18"
			style="background-color:rgb(204, 142, 105);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="21"
			style="background-color:rgb(196, 40, 28);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="22"
			style="background-color:rgb(196, 112, 160);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="23"
			style="background-color:rgb(13, 105, 172);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="24"
			style="background-color:rgb(245, 205, 48);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="25"
			style="background-color:rgb(98, 71, 50);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="26"
			style="background-color:rgb(27, 42, 53);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="27"
			style="background-color:rgb(109, 110, 108);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="28"
			style="background-color:rgb(40, 127, 71);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="29"
			style="background-color:rgb(161, 196, 140);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="36"
			style="background-color:rgb(243, 207, 155);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="37"
			style="background-color:rgb(75, 151, 75);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="38"
			style="background-color:rgb(160, 95, 53);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="39"
			style="background-color:rgb(193, 202, 222);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="40"
			style="background-color:rgb(236, 236, 236);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="41"
			style="background-color:rgb(205, 84, 75);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="42"
			style="background-color:rgb(193, 223, 240);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="43"
			style="background-color:rgb(123, 182, 232);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="44"
			style="background-color:rgb(247, 241, 141);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="45"
			style="background-color:rgb(180, 210, 228);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="47"
			style="background-color:rgb(217, 133, 108);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="48"
			style="background-color:rgb(132, 182, 141);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="49"
			style="background-color:rgb(248, 241, 132);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="50"
			style="background-color:rgb(236, 232, 222);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="100"
			style="background-color:rgb(238, 196, 182);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="101"
			style="background-color:rgb(218, 134, 122);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="102"
			style="background-color:rgb(110, 153, 202);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="103"
			style="background-color:rgb(199, 193, 183);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="104"
			style="background-color:rgb(107, 50, 124);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="105"
			style="background-color:rgb(226, 155, 64);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="106"
			style="background-color:rgb(218, 133, 65);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="107"
			style="background-color:rgb(0, 143, 156);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="108"
			style="background-color:rgb(104, 92, 67);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="110"
			style="background-color:rgb(67, 84, 147);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="111"
			style="background-color:rgb(191, 183, 177);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="112"
			style="background-color:rgb(104, 116, 172);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="113"
			style="background-color:rgb(229, 173, 200);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="115"
			style="background-color:rgb(199, 210, 60);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="116"
			style="background-color:rgb(85, 165, 175);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="118"
			style="background-color:rgb(183, 215, 213);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="119"
			style="background-color:rgb(164, 189, 71);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="120"
			style="background-color:rgb(217, 228, 167);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="121"
			style="background-color:rgb(231, 172, 88);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="123"
			style="background-color:rgb(211, 111, 76);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="124"
			style="background-color:rgb(146, 57, 120);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="125"
			style="background-color:rgb(234, 184, 146);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="126"
			style="background-color:rgb(165, 165, 203);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="127"
			style="background-color:rgb(220, 188, 129);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="128"
			style="background-color:rgb(174, 122, 89);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="131"
			style="background-color:rgb(156, 163, 168);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="133"
			style="background-color:rgb(213, 115, 61);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="134"
			style="background-color:rgb(216, 221, 86);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="135"
			style="background-color:rgb(116, 134, 157);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="136"
			style="background-color:rgb(135, 124, 144);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="137"
			style="background-color:rgb(224, 152, 100);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="138"
			style="background-color:rgb(149, 138, 115);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="140"
			style="background-color:rgb(32, 58, 86);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="141"
			style="background-color:rgb(39, 70, 45);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="143"
			style="background-color:rgb(207, 226, 247);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="145"
			style="background-color:rgb(121, 136, 161);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="146"
			style="background-color:rgb(149, 142, 163);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="147"
			style="background-color:rgb(147, 135, 103);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="148"
			style="background-color:rgb(87, 88, 87);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="149"
			style="background-color:rgb(22, 29, 50);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="150"
			style="background-color:rgb(171, 173, 172);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="151"
			style="background-color:rgb(120, 144, 130);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="153"
			style="background-color:rgb(149, 121, 119);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="154"
			style="background-color:rgb(123, 46, 47);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="157"
			style="background-color:rgb(255, 246, 123);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="158"
			style="background-color:rgb(225, 164, 194);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="168"
			style="background-color:rgb(117, 108, 98);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="176"
			style="background-color:rgb(151, 105, 91);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="178"
			style="background-color:rgb(180, 132, 85);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="179"
			style="background-color:rgb(137, 135, 136);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="180"
			style="background-color:rgb(215, 169, 75);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="190"
			style="background-color:rgb(249, 214, 46);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="191"
			style="background-color:rgb(232, 171, 45);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="192"
			style="background-color:rgb(105, 64, 40);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="193"
			style="background-color:rgb(207, 96, 36);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="194"
			style="background-color:rgb(163, 162, 165);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="195"
			style="background-color:rgb(70, 103, 164);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="196"
			style="background-color:rgb(35, 71, 139);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="198"
			style="background-color:rgb(142, 66, 133);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="199"
			style="background-color:rgb(99, 95, 98);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="200"
			style="background-color:rgb(130, 138, 93);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="208"
			style="background-color:rgb(229, 228, 223);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="209"
			style="background-color:rgb(176, 142, 68);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="210"
			style="background-color:rgb(112, 149, 120);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="211"
			style="background-color:rgb(121, 181, 181);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="212"
			style="background-color:rgb(159, 195, 233);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="213"
			style="background-color:rgb(108, 129, 183);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="216"
			style="background-color:rgb(144, 76, 42);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="217"
			style="background-color:rgb(124, 92, 70);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="218"
			style="background-color:rgb(150, 112, 159);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="219"
			style="background-color:rgb(107, 98, 155);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="220"
			style="background-color:rgb(167, 169, 206);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="221"
			style="background-color:rgb(205, 98, 152);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="222"
			style="background-color:rgb(228, 173, 200);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="223"
			style="background-color:rgb(220, 144, 149);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="224"
			style="background-color:rgb(240, 213, 160);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="225"
			style="background-color:rgb(235, 184, 127);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="226"
			style="background-color:rgb(253, 234, 141);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="232"
			style="background-color:rgb(125, 187, 221);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="268"
			style="background-color:rgb(52, 43, 117);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="301"
			style="background-color:rgb(80, 109, 84);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="302"
			style="background-color:rgb(91, 93, 105);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="303"
			style="background-color:rgb(0, 16, 176);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="304"
			style="background-color:rgb(44, 101, 29);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="305"
			style="background-color:rgb(82, 124, 174);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="306"
			style="background-color:rgb(51, 88, 130);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="307"
			style="background-color:rgb(16, 42, 220);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="308"
			style="background-color:rgb(61, 21, 133);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="309"
			style="background-color:rgb(52, 142, 64);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="310"
			style="background-color:rgb(91, 154, 76);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="311"
			style="background-color:rgb(159, 161, 172);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="312"
			style="background-color:rgb(89, 34, 89);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="313"
			style="background-color:rgb(31, 128, 29);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="314"
			style="background-color:rgb(159, 173, 192);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="315"
			style="background-color:rgb(9, 137, 207);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="316"
			style="background-color:rgb(123, 0, 123);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="317"
			style="background-color:rgb(124, 156, 107);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="318"
			style="background-color:rgb(138, 171, 133);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="319"
			style="background-color:rgb(185, 196, 177);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="320"
			style="background-color:rgb(202, 203, 209);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="321"
			style="background-color:rgb(167, 94, 155);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="322"
			style="background-color:rgb(123, 47, 123);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="323"
			style="background-color:rgb(148, 190, 129);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="324"
			style="background-color:rgb(168, 189, 153);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="325"
			style="background-color:rgb(223, 223, 222);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="327"
			style="background-color:rgb(151, 0, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="328"
			style="background-color:rgb(177, 229, 166);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="329"
			style="background-color:rgb(152, 194, 219);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="330"
			style="background-color:rgb(255, 152, 220);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="331"
			style="background-color:rgb(255, 89, 89);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="332"
			style="background-color:rgb(117, 0, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="333"
			style="background-color:rgb(239, 184, 56);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="334"
			style="background-color:rgb(248, 217, 109);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="335"
			style="background-color:rgb(231, 231, 236);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="336"
			style="background-color:rgb(199, 212, 228);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="337"
			style="background-color:rgb(255, 148, 148);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="338"
			style="background-color:rgb(190, 104, 98);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="339"
			style="background-color:rgb(86, 36, 36);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="340"
			style="background-color:rgb(241, 231, 199);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="341"
			style="background-color:rgb(254, 243, 187);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="342"
			style="background-color:rgb(224, 178, 208);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="343"
			style="background-color:rgb(212, 144, 189);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="344"
			style="background-color:rgb(150, 85, 85);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="345"
			style="background-color:rgb(143, 76, 42);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="346"
			style="background-color:rgb(211, 190, 150);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="347"
			style="background-color:rgb(226, 220, 188);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="348"
			style="background-color:rgb(237, 234, 234);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="349"
			style="background-color:rgb(233, 218, 218);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="350"
			style="background-color:rgb(136, 62, 62);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="351"
			style="background-color:rgb(188, 155, 93);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="352"
			style="background-color:rgb(199, 172, 120);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="353"
			style="background-color:rgb(202, 191, 163);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="354"
			style="background-color:rgb(187, 179, 178);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="355"
			style="background-color:rgb(108, 88, 75);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="356"
			style="background-color:rgb(160, 132, 79);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="357"
			style="background-color:rgb(149, 137, 136);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="358"
			style="background-color:rgb(171, 168, 158);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="359"
			style="background-color:rgb(175, 148, 131);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="360"
			style="background-color:rgb(150, 103, 102);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="361"
			style="background-color:rgb(86, 66, 54);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="362"
			style="background-color:rgb(126, 104, 63);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="363"
			style="background-color:rgb(105, 102, 92);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="364"
			style="background-color:rgb(90, 76, 66);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="365"
			style="background-color:rgb(106, 57, 9);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1001"
			style="background-color:rgb(248, 248, 248);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1002"
			style="background-color:rgb(205, 205, 205);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1003"
			style="background-color:rgb(17, 17, 17);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1004"
			style="background-color:rgb(255, 0, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1005"
			style="background-color:rgb(255, 176, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1006"
			style="background-color:rgb(180, 128, 255);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1007"
			style="background-color:rgb(163, 75, 75);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1008"
			style="background-color:rgb(193, 190, 66);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1009"
			style="background-color:rgb(255, 255, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1010"
			style="background-color:rgb(0, 0, 255);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1011"
			style="background-color:rgb(0, 32, 96);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1012"
			style="background-color:rgb(33, 84, 185);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1013"
			style="background-color:rgb(4, 175, 236);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1014"
			style="background-color:rgb(170, 85, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1015"
			style="background-color:rgb(170, 0, 170);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1016"
			style="background-color:rgb(255, 102, 204);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1017"
			style="background-color:rgb(255, 175, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1018"
			style="background-color:rgb(18, 238, 212);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1019"
			style="background-color:rgb(0, 255, 255);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1020"
			style="background-color:rgb(0, 255, 0);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1021"
			style="background-color:rgb(58, 125, 21);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1022"
			style="background-color:rgb(127, 142, 100);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1023"
			style="background-color:rgb(140, 91, 159);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1024"
			style="background-color:rgb(175, 221, 255);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1025"
			style="background-color:rgb(255, 201, 201);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1026"
			style="background-color:rgb(177, 167, 255);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1027"
			style="background-color:rgb(159, 243, 233);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1028"
			style="background-color:rgb(204, 255, 204);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1029"
			style="background-color:rgb(255, 255, 204);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1030"
			style="background-color:rgb(255, 204, 153);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1031"
			style="background-color:rgb(98, 37, 209);height:40px;width:40px;" />
		<input
			type="radio"
			class="rounded-full"
			bind:group={color}
			value="1032"
			style="background-color:rgb(255, 0, 191);height:40px;width:40px;" />
	</div>
</div>
