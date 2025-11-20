<script lang="ts">
import type { SlotsType, VNode } from 'vue';

<<<<<<< HEAD
export default {
  slots: Object as SlotsType<{
    default: { num: number };
    foo: { str: string };
  }>,
=======
export default {} as any as new () => {
  $slots: {
    default(_: { num: number }): VNode[];
    foo(_: { str: string }): VNode[];
  };
>>>>>>> upstream/next
};
</script>
