import { renderText, Frame } from '../src/index';

const exampleCom = `####### ### ##### #######
#     # #  ## #   #     #
# ### #    ### ## # ### #
# ### # # #   ##  # ### #
# ### # ## #   ## # ### #
#     #   # # #   #     #
####### # # # # # #######
         #  #  ##        
#     ## #  #    #  ## ##
 #  #   ## ##      ## ## 
 ##  #### ##    ## # # ##
#   #  ## ### ## ##      
# ## ##  # ## #  # ## #  
  ###  ########  #  #   #
# # ###  #   #  ## ######
       # ## ###    ## ## 
 ########## ### ######  #
         ###   ##   ###  
####### #  ## ### # ##  #
#     #  ####  ##   #  # 
# ### #  ##  ## ##### ## 
# ### #  ###  ##      # #
# ### #  # #  ####    ## 
#     #  # # ## ## # ### 
####### # ### ##  # #####`;

import fs from "fs"
import crypto from "crypto"
fs.writeFileSync("./test/resources.txt", "");
for (let i = 0; i < 4096; i++) {
  const randomStr = crypto.randomBytes(i).toString("hex")

  const randomStringBytes = new TextEncoder().encode(randomStr)

  const code = new Frame({ value: randomStr });

  const codeBytes = new Uint8Array(code.buffer);

  const combinedBuffer = new Uint8Array(randomStringBytes.length + codeBytes.length)
  combinedBuffer.set(randomStringBytes, 0);
  combinedBuffer.set(codeBytes, randomStringBytes.length)
  
  fs.appendFileSync(`./test/resources.txt`, combinedBuffer) // seperator is &&\n
}

test('Ensure base example.com example is valid', () => {
  expect(renderText({ value: 'https://example.com' })).toBe(exampleCom);
});

test('Ensure options can be passed to text renderer', () => {
  expect(renderText({
    value: 'https://example.com',
    foregroundChar: '█',
    backgroundChar: ' '
  })).toBe(exampleCom.replaceAll('#', '█'));
});
